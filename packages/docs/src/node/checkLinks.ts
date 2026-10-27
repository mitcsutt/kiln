import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import { dirname, join } from 'node:path'
import { parse } from 'node-html-parser'
import { DEFAULT_SEARCH_PROVIDER, SEARCH_ROUTE, type SearchProvider } from '../config.ts'
import { PAGEFIND_DIR, PAGEFIND_SCRIPT } from '../pagefind.ts'

const CONCURRENCY = 8
/** Every request, and the whole run, gives up rather than hang. */
const REQUEST_TIMEOUT_MS = 30_000
const RUN_TIMEOUT_MS = 5 * 60_000

function freePort(): Promise<number> {
  return new Promise((done, fail) => {
    const server = createServer()
    server.once('error', fail)
    server.listen(0, () => {
      const address = server.address()
      server.close(() => {
        if (address && typeof address === 'object') done(address.port)
        else fail(new Error('No port'))
      })
    })
  })
}

interface Fetched {
  status: number
  ids: Set<string>
  links: string[]
}

export interface CheckLinksOptions {
  /** The site's root: Wrangler serves its export with its `wrangler.jsonc`. */
  root: string
  /** Where the site is deployed (`site.url`). Absolute links to it, as `llms.txt` writes them, are checked here. */
  url: string
  /** The site's `search.provider`, whose index is checked with the pages. */
  search?: SearchProvider
}

/** What a provider's index is served as: Pagefind's script and entry file, or the Orama index. */
const SEARCH_FILES: Readonly<Record<SearchProvider, readonly string[]>> = {
  pagefind: [PAGEFIND_SCRIPT, `/${PAGEFIND_DIR}/pagefind-entry.json`],
  'orama-static': [SEARCH_ROUTE],
}

/** Wrangler's own binary, from the site's dependencies. */
function wranglerBin(root: string): string {
  try {
    const manifest = createRequire(join(root, 'package.json')).resolve('wrangler/package.json')
    return join(dirname(manifest), 'bin/wrangler.js')
  } catch {
    throw new Error(
      "kiln-docs check-links serves the export with Wrangler, which the site doesn't have. Add it: pnpm add -D wrangler",
    )
  }
}

/**
 * `kiln-docs check-links`: serves the built site and follows every internal link from `/`,
 * returning a problem for each page that doesn't answer 200 and each `#anchor` that names no
 * element on its page. Run it after the build.
 *
 * It checks the site as a reader gets it: `wrangler dev` serves `out/` with the deployed Worker's
 * config and `_headers` (ADR 0034), so `/docs/<page>.md`, `llms.txt` and the search index are
 * crawled like any other page: Pagefind's script and entry file, or the Orama index at
 * `/api/search` (ADR 0048).
 */
export async function checkLinks({
  root,
  url: siteUrl,
  search = DEFAULT_SEARCH_PROVIDER,
}: CheckLinksOptions): Promise<{ checked: number; problems: string[] }> {
  const port = await freePort()
  const origin = `http://127.0.0.1:${String(port)}`
  // Wrangler's own binary, not `pnpm exec`, in its own process group: killing a wrapper would
  // leave the server running and holding this process open.
  const server = spawn(
    process.execPath,
    [wranglerBin(root), 'dev', '--port', String(port), '--ip', '127.0.0.1', '--log-level', 'warn'],
    {
      cwd: root,
      env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
      stdio: ['ignore', 'ignore', 'inherit'],
      detached: true,
    },
  )

  function stopServer(): void {
    if (server.pid === undefined || server.exitCode !== null) return
    try {
      process.kill(-server.pid, 'SIGTERM')
    } catch {
      // already gone
    }
  }

  async function waitForServer(): Promise<void> {
    for (let attempt = 0; attempt < 120; attempt++) {
      try {
        const response = await fetch(origin, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
        if (response.status < 500) return
      } catch {
        // not listening yet
      }
      await new Promise((done) => setTimeout(done, 500))
    }
    throw new Error('The docs server did not start. Build the site first.')
  }

  const fetched = new Map<string, Promise<Fetched>>()
  const problems: string[] = []

  /**
   * Same-origin links in a page, resolved against it. Live examples link to `#stops` and
   * the like to show a component, not to go anywhere, so fragment-only links inside an
   * example stage are skipped. Their links to other pages are still checked.
   */
  function linksIn(html: string, base: URL): string[] {
    const found: string[] = []
    for (const anchor of parse(html).querySelectorAll('a[href]')) {
      const href = anchor.getAttribute('href')
      if (!href || /^(mailto|tel|javascript):/.test(href)) continue
      if (href.startsWith('#') && anchor.closest('[data-example-stage]')) continue
      const url = new URL(href, base)
      if (url.origin !== origin) continue
      found.push(url.pathname + url.search + url.hash)
    }
    return found
  }

  /** Links in the Markdown routes: `[text](url)`, with the public site's URLs mapped here. */
  function markdownLinksIn(markdown: string, base: URL): string[] {
    const found: string[] = []
    for (const match of markdown.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = match[1]
      if (!href) continue
      const url = new URL(href.startsWith(siteUrl) ? href.slice(siteUrl.length) || '/' : href, base)
      if (url.origin !== origin) continue
      // Fragments in Markdown point at headings in the HTML page, which the HTML crawl checks.
      found.push(url.pathname + url.search)
    }
    return found
  }

  function load(path: string): Promise<Fetched> {
    const existing = fetched.get(path)
    if (existing) return existing
    const pending = (async () => {
      const response = await fetch(origin + path, {
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      const type = response.headers.get('content-type') ?? ''
      if (type.includes('text/markdown')) {
        return {
          status: response.status,
          ids: new Set<string>(),
          links: markdownLinksIn(await response.text(), new URL(origin + path)),
        }
      }
      if (!type.includes('text/html')) {
        await response.arrayBuffer()
        return { status: response.status, ids: new Set<string>(), links: [] }
      }
      const html = await response.text()
      const ids = new Set(
        parse(html)
          .querySelectorAll('[id]')
          .map((element) => element.id),
      )
      return { status: response.status, ids, links: linksIn(html, new URL(origin + path)) }
    })()
    fetched.set(path, pending)
    return pending
  }

  async function crawl(start: string[]): Promise<number> {
    const queue = [...start]
    const seen = new Set(queue)
    const referrers = new Map<string, string>()
    let checked = 0
    const worker = async (): Promise<void> => {
      for (let target = queue.shift(); target !== undefined; target = queue.shift()) {
        const [path = '/', hash] = target.split('#')
        const page = await load(path)
        checked++
        const from = referrers.get(target) ?? 'the start list'
        if (page.status !== 200) {
          problems.push(`${String(page.status)} ${path} (linked from ${from})`)
          continue
        }
        if (hash && !page.ids.has(decodeURIComponent(hash))) {
          problems.push(`missing #${hash} on ${path} (linked from ${from})`)
        }
        for (const link of page.links) {
          if (seen.has(link)) continue
          seen.add(link)
          referrers.set(link, path)
          queue.push(link)
        }
      }
    }
    // Workers stop when the queue runs dry, so keep going until a round finds nothing new.
    while (queue.length) await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    return checked
  }

  let timer: NodeJS.Timeout | undefined
  const deadline = new Promise<never>((_done, fail) => {
    timer = setTimeout(() => {
      fail(new Error(`The link check took longer than ${String(RUN_TIMEOUT_MS / 60_000)} minutes.`))
    }, RUN_TIMEOUT_MS)
  })
  try {
    return await Promise.race([
      (async () => {
        await waitForServer()
        const checked = await crawl([
          '/',
          '/docs',
          '/llms.txt',
          '/llms-full.txt',
          ...SEARCH_FILES[search],
        ])
        return { checked, problems: problems.sort() }
      })(),
      deadline,
    ])
  } finally {
    clearTimeout(timer)
    stopServer()
  }
}
