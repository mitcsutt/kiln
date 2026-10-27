/**
 * The out-of-workspace smoke test (ADR 0046, Phase 4): a site shaped like a real one, installed
 * from the packed kiln-docs tarball in a temporary folder outside the repository, so nothing
 * resolves through the workspace's links or its `node_modules`. Its peers are resolved fresh, with
 * no lockfile. Each variant installs, runs the site's `build` (its generator, `next build`, then
 * `kiln-docs postbuild`) and `check-links`, then checks the export, and searches it from the
 * header in Chromium (ADR 0049).
 *
 *   node scripts/smoke.ts [variant ...]   after `pnpm build`; every variant when none is named
 *
 * - `fixed`: the fixture in `smoke/site` as it is: Flightdeck fixed, no picker, Pagefind. Its
 *   search is also checked under `next dev`, which searches the Orama index instead.
 * - `picker`: `smoke/variants/picker` over it, a reader's theme picker, with kiln-ui at the
 *   declared floor of its peer range, and the Orama index, `search.provider: 'orama-static'`.
 * - `no-shiki`: the fixture without `shiki` in its dependencies, as the install line has it.
 */
import { execFileSync, spawn } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join, normalize, relative } from 'node:path'
import { parse, type HTMLElement } from 'node-html-parser'
import { chromium } from 'playwright'

const pkg = join(import.meta.dirname, '..')
const repo = join(pkg, '../..')
const fixture = join(pkg, 'smoke/site')

interface Manifest {
  dependencies: Record<string, string>
  peerDependencies: Record<string, string>
}
const manifest = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')) as Manifest

/** kiln-ui's declared floor: `0.8.0` from `>=0.8.0 <1.0.0`. */
const kilnUiFloor = /^>=(\d+\.\d+\.\d+)\s/.exec(
  manifest.peerDependencies['@mitcsutt/kiln-ui'] ?? '',
)
if (!kilnUiFloor?.[1]) throw new Error("Can't read kiln-ui's floor from the peer range")

interface Variant {
  /** A folder of files copied over the fixture. */
  overlay?: string
  /** Changes to the site's dependencies. `null` removes one. */
  dependencies?: Record<string, string | null>
  picker: boolean
  /** The site's `search.provider`. */
  search: 'pagefind' | 'orama-static'
  /** Whether its search is also checked under `next dev`. */
  dev?: boolean
}

const VARIANTS: Record<string, Variant> = {
  fixed: { picker: false, search: 'pagefind', dev: true },
  picker: {
    overlay: join(pkg, 'smoke/variants/picker'),
    dependencies: { '@mitcsutt/kiln-ui': kilnUiFloor[1] },
    picker: true,
    search: 'orama-static',
  },
  'no-shiki': { dependencies: { shiki: null }, picker: false, search: 'pagefind' },
}

/** Every page the fixture has: hand-written, generated, and `plugins/git` in both. */
const PAGES = [
  '/docs',
  '/docs/guides/getting-started',
  '/docs/guides/writing-a-plugin',
  '/docs/plugins',
  '/docs/plugins/git',
  '/docs/plugins/memory',
  '/docs/plugins/review',
]
const SITE_URL = 'https://smoke.example.com'
const SITE_NAME = 'Smoke Toolbelt'

function run(command: string, args: string[], cwd: string): void {
  console.log(`$ ${command} ${args.join(' ')}`)
  execFileSync(command, args, { cwd, stdio: 'inherit' })
}

function timed(label: string, times: Record<string, number>, step: () => void): void {
  const start = performance.now()
  step()
  times[label] = Math.round(performance.now() - start)
}

class Checks {
  readonly failures: string[] = []
  count = 0
  that(ok: boolean, message: string): void {
    this.count++
    if (!ok) this.failures.push(message)
  }
}

const read = (file: string) => readFileSync(file, 'utf8')
const htmlFile = (out: string, url: string) => join(out, `${url}.html`)
const mdFile = (out: string, url: string) => join(out, `${url}.md`)

/** The sidebar's link lists: the navigation landmarks named after the site. */
function sidebarLinks(doc: HTMLElement): string[] {
  return doc
    .querySelectorAll('nav')
    .filter((nav) => nav.getAttribute('aria-label')?.startsWith(SITE_NAME))
    .flatMap((nav) => nav.querySelectorAll('a').map((a) => a.getAttribute('href') ?? ''))
}

function checkExport(site: string, variant: Variant, checks: Checks): void {
  const out = join(site, 'out')

  // The landing page at `/`, and the docs at `/docs`.
  const landing = parse(read(join(out, 'index.html')))
  checks.that(landing.querySelector('h1')?.text === SITE_NAME, 'the landing page has its heading')
  checks.that(
    landing.querySelectorAll('a').some((a) => a.getAttribute('href') === '/docs'),
    'the landing page links to /docs',
  )

  // Every page, its Markdown, and the indexes.
  const llms = existsSync(join(out, 'llms.txt')) ? read(join(out, 'llms.txt')) : ''
  const llmsFull = existsSync(join(out, 'llms-full.txt')) ? read(join(out, 'llms-full.txt')) : ''
  checks.that(llms.startsWith(`# ${SITE_NAME}\n`), 'llms.txt starts with the site name')
  checks.that(llms.includes(`${SITE_URL}/llms-full.txt`), 'llms.txt points at llms-full.txt')
  for (const url of PAGES) {
    checks.that(existsSync(htmlFile(out, url)), `${url}.html is exported`)
    const md = existsSync(mdFile(out, url)) ? read(mdFile(out, url)) : ''
    checks.that(md.startsWith('# '), `${url}.md is served, starting with its title`)
    checks.that(md.includes(`Source: ${SITE_URL}${url}\n`), `${url}.md names its source`)
    checks.that(llms.includes(`(${SITE_URL}${url}.md)`), `llms.txt lists ${url}.md`)
    checks.that(llmsFull.includes(`Source: ${SITE_URL}${url}\n`), `llms-full.txt holds ${url}`)
  }
  for (const file of ['sitemap.xml', 'robots.txt']) {
    const text = existsSync(join(out, file)) ? read(join(out, file)) : ''
    checks.that(text.includes(SITE_URL), `${file} is exported with the site's URL`)
  }

  // The sidebar reaches every page. A group is a disclosure that's open on its own pages, so
  // every page is linked from the sidebar of some page, and the docs index has every group.
  const reached = new Set<string>()
  for (const url of PAGES) {
    if (existsSync(htmlFile(out, url))) {
      for (const href of sidebarLinks(parse(read(htmlFile(out, url))))) reached.add(href)
    }
  }
  for (const url of PAGES) checks.that(reached.has(url), `the sidebar reaches ${url}`)
  const index = parse(read(htmlFile(out, '/docs')))
  const disclosures = index.querySelectorAll('button[aria-expanded]').map((b) => b.text.trim())
  for (const group of ['Guides', 'Plugins']) {
    checks.that(disclosures.includes(group), `the docs index's sidebar has the ${group} group`)
  }

  // A hand-written page beats the generated one with its slug.
  checks.that(
    read(mdFile(out, '/docs/plugins/git')).includes('written by hand'),
    'the hand-written plugins/git wins over the generated one',
  )

  // Raw HTML in `.md` is text: escaped in the page, verbatim in its Markdown, comments dropped.
  const started = read(htmlFile(out, '/docs/guides/getting-started'))
  checks.that(started.includes('&lt;name&gt;'), '<name> is shown as text in the page')
  checks.that(!started.includes('never shown'), "an HTML comment isn't shown in the page")
  const startedMd = read(mdFile(out, '/docs/guides/getting-started'))
  checks.that(
    startedMd.includes('by its <name>.') && !startedMd.includes('\\<name>'),
    'the Markdown keeps <name> verbatim',
  )

  // Highlighting, with Shiki installed whether or not the site lists it.
  checks.that(
    read(htmlFile(out, '/docs/guides/writing-a-plugin')).includes('data-token="keyword"'),
    'a TypeScript block is highlighted',
  )

  // The theme mode, on the landing page, a docs page and the 404 page.
  const notFound = read(join(out, '404.html'))
  checks.that(notFound.includes('That page isn’t here.'), 'the 404 page is the themed NotFound')
  const theme = variant.picker ? 'paper' : 'flightdeck'
  for (const [name, html] of [
    ['/', read(join(out, 'index.html'))],
    ['/docs', read(htmlFile(out, '/docs'))],
    ['404', notFound],
  ] as const) {
    checks.that(
      html.includes(`data-theme="${theme}"`),
      `${name} renders with data-theme="${theme}"`,
    )
    const picker = html.includes('aria-label="Theme"')
    checks.that(
      picker === variant.picker,
      `${name} ${variant.picker ? 'renders' : "doesn't render"} the theme picker`,
    )
    // The theme's head script, among Next.js's own: the inline one that sets the theme.
    const head =
      parse(html)
        .querySelectorAll('head script:not([src])')
        .map((script) => script.text)
        .find((text) => text.includes('dataset.theme')) ?? ''
    checks.that(
      head.includes('kiln-docs-theme') === variant.picker,
      `${name}'s head script ${variant.picker ? 'reads' : "doesn't read"} a picked theme`,
    )
    checks.that(head.includes('kiln-color-mode'), `${name}'s head script reads the colour mode`)
  }
}

const TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
}

async function isFile(file: string): Promise<boolean> {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

/** Serves `out/` as Wrangler's `auto-trailing-slash` does: `/docs` is `docs.html`. */
async function serveExport(out: string): Promise<{ origin: string; server: Server }> {
  const server = createServer((request, response) => {
    const { pathname } = new URL(request.url ?? '/', 'http://localhost')
    const path = normalize(decodeURIComponent(pathname)).replace(/^\/+|\/+$/g, '')
    const candidates = path ? [path, `${path}.html`, join(path, 'index.html')] : ['index.html']
    void (async () => {
      let file: string | undefined
      for (const candidate of path.startsWith('..') ? [] : candidates) {
        if (await isFile(join(out, candidate))) {
          file = join(out, candidate)
          break
        }
      }
      const body = file ?? join(out, '404.html')
      response.writeHead(file ? 200 : 404, {
        'content-type': TYPES[extname(body)] ?? 'application/octet-stream',
      })
      response.end(await readFile(body))
    })()
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('No server address')
  return { origin: `http://127.0.0.1:${String(address.port)}`, server }
}

/**
 * Searches the site from the header's dialog in Chromium: "helper" is only on the hand-written
 * `plugins/git` page, so it's the first result. `from` is what the search must have loaded: the
 * Pagefind script, or the Orama index from the search route.
 */
async function checkSearch(origin: string, from: string, label: string, checks: Checks) {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    const requests: string[] = []
    const errors: string[] = []
    page.on('request', (request) => requests.push(new URL(request.url()).pathname))
    page.on('pageerror', (error) => errors.push(error.message))
    const first = await (async () => {
      await page.goto(`${origin}/docs`)
      await page
        .getByRole('button', { name: /Search/ })
        .first()
        .click()
      await page.getByRole('searchbox', { name: 'Search' }).fill('helper')
      const results = page.getByRole('list', { name: 'Results' })
      await results.waitFor()
      return results.getByRole('link').first().getAttribute('href')
    })().catch((error: unknown) => String(error).split('\n')[0])
    checks.that(
      first === '/docs/plugins/git',
      `${label}: search for "helper" finds /docs/plugins/git first, not ${String(first)}`,
    )
    checks.that(requests.includes(from), `${label}: search loads ${from}`)
    checks.that(errors.length === 0, `${label}: no page errors, not ${errors.join('; ')}`)
  } finally {
    await browser.close()
  }
}

/** The built site's search: the provider's files in the export, then a search in Chromium. */
async function checkBuiltSearch(site: string, variant: Variant, checks: Checks) {
  const out = join(site, 'out')
  const pagefind = variant.search === 'pagefind'
  checks.that(
    existsSync(join(out, 'pagefind/pagefind.js')) === pagefind,
    `the export ${pagefind ? 'has' : "hasn't"} a Pagefind index`,
  )
  checks.that(
    existsSync(join(out, 'api/search')) !== pagefind,
    `the export ${pagefind ? "hasn't" : 'has'} the Orama index at /api/search`,
  )
  const { origin, server } = await serveExport(out)
  try {
    await checkSearch(origin, pagefind ? '/pagefind/pagefind.js' : '/api/search', 'build', checks)
  } finally {
    server.close()
  }
}

/** A free port on the loopback interface. */
async function freePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  await new Promise((resolve) => server.close(resolve))
  if (address === null || typeof address === 'string') throw new Error('No server address')
  return address.port
}

/** Under `next dev` there's no export to index, so Pagefind's header searches the Orama route. */
async function checkDevSearch(site: string, checks: Checks) {
  const port = await freePort()
  // localhost, not 127.0.0.1: Next.js serves its dev resources to another host only when
  // `allowedDevOrigins` names it, and the page doesn't hydrate without them.
  const origin = `http://localhost:${String(port)}`
  console.log(`$ next dev --port ${String(port)}`)
  const dev = spawn('pnpm', ['exec', 'next', 'dev', '--port', String(port)], {
    cwd: site,
    stdio: 'inherit',
    detached: true,
  })
  try {
    // The first request compiles the page, so the dev server is ready once /docs answers.
    const deadline = Date.now() + 120_000
    let ready = false
    while (!ready && Date.now() < deadline) {
      ready = await fetch(`${origin}/docs`).then(
        (response) => response.ok,
        () => false,
      )
      if (!ready) await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    checks.that(ready, 'next dev serves /docs')
    if (ready) await checkSearch(origin, '/api/search', 'next dev', checks)
  } finally {
    if (dev.pid) process.kill(-dev.pid, 'SIGTERM')
  }
}

async function smoke(name: string, variant: Variant, tarball: string, root: string) {
  const site = join(root, name)
  cpSync(fixture, site, { recursive: true })
  if (variant.overlay) cpSync(variant.overlay, site, { recursive: true })
  const sitePkg = JSON.parse(read(join(site, 'package.json'))) as Manifest
  const dependencies: Record<string, string | null> = {
    ...sitePkg.dependencies,
    '@mitcsutt/kiln-docs': `file:${tarball}`,
    ...variant.dependencies,
  }
  sitePkg.dependencies = Object.fromEntries(
    Object.entries(dependencies).filter((entry): entry is [string, string] => entry[1] !== null),
  )
  writeFileSync(join(site, 'package.json'), `${JSON.stringify(sitePkg, null, 2)}\n`)

  const times: Record<string, number> = {}
  for (const script of ['install', 'build', 'check-links']) {
    timed(script, times, () => {
      run('pnpm', [script], site)
    })
  }
  const installed = execFileSync('pnpm', ['list', '--depth=0', '--json'], { cwd: site })
  const [list] = JSON.parse(installed.toString()) as [
    { dependencies?: Record<string, { version: string }> },
  ]
  const versions = Object.fromEntries(
    Object.entries(list.dependencies ?? {}).map(([dep, { version }]) => [dep, version]),
  )
  const checks = new Checks()
  checkExport(site, variant, checks)
  await checkBuiltSearch(site, variant, checks)
  if (variant.dev) await checkDevSearch(site, checks)
  return { name, times, versions, checks }
}

const names = process.argv.slice(2)
for (const name of names) {
  if (!(name in VARIANTS))
    throw new Error(`No variant "${name}": ${Object.keys(VARIANTS).join(', ')}`)
}
if (!existsSync(join(pkg, 'dist/node/cli.js'))) {
  throw new Error('No dist/ to pack: run `pnpm build` in packages/docs first.')
}

const root = mkdtempSync(join(tmpdir(), 'kiln-docs-smoke-'))
if (!relative(repo, root).startsWith('..')) {
  throw new Error(`${root} is inside the repository, so it would resolve the workspace's packages`)
}
const tarball = join(root, 'kiln-docs.tgz')
run('pnpm', ['pack', '--out', tarball], pkg)

let failed = false
try {
  for (const name of names.length ? names : Object.keys(VARIANTS)) {
    const variant = VARIANTS[name]
    if (!variant) continue
    console.log(`\n== kiln-docs smoke: ${name} (${join(root, name)})`)
    const result = await smoke(name, variant, tarball, root)
    console.log(`\n== ${name}: installed`)
    for (const [dep, version] of Object.entries(result.versions)) console.log(`  ${dep} ${version}`)
    console.log(`== ${name}: ${JSON.stringify(result.times)} ms`)
    if (result.checks.failures.length) {
      failed = true
      console.error(
        `== ${name}: ${String(result.checks.failures.length)} of ${String(result.checks.count)} checks failed:`,
      )
      for (const failure of result.checks.failures) console.error(`  ✗ ${failure}`)
    } else {
      console.log(`== ${name}: all ${String(result.checks.count)} checks passed`)
    }
  }
} finally {
  // Kept on failure, to look at; set KILN_DOCS_SMOKE_KEEP to keep it anyway.
  if (!failed && !process.env.KILN_DOCS_SMOKE_KEEP) rmSync(root, { recursive: true, force: true })
  else console.log(`\nThe smoke sites are in ${root}`)
}
process.exitCode = failed ? 1 : 0
