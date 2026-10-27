/**
 * Browser and axe checks on the docs chrome, against the built site (ADR 0046). Run it after
 * `pnpm build`:
 *
 *   node scripts/check-browser.ts
 *
 * It serves `out/` as the Worker does (`/docs/ui` is `docs/ui.html`, and any other path is the
 * 404 page with a 404 status), then drives Chromium through the chrome: the sidebar, the
 * breadcrumb, search, the theme picker, the phone navigation, and a reader's saved state under
 * the four keys that never change. axe checks the chrome's pages in light and dark. Any failed
 * check, page error or console error fails the run.
 */
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { extname, join, normalize } from 'node:path'

import { chromium, type Page } from 'playwright'

const ROOT = join(import.meta.dirname, '..', 'out')
const AXE = createRequire(import.meta.url).resolve('axe-core/axe.min.js')

const TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.woff2': 'font/woff2',
}

async function isFile(file: string): Promise<boolean> {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

/** The export's file for a path, as Wrangler's `auto-trailing-slash` finds it. */
async function fileFor(pathname: string): Promise<string | undefined> {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^\/+|\/+$/g, '')
  if (relative.startsWith('..')) return undefined
  const candidates = relative
    ? [relative, `${relative}.html`, join(relative, 'index.html')]
    : ['index.html']
  for (const candidate of candidates) {
    if (await isFile(join(ROOT, candidate))) return join(ROOT, candidate)
  }
  return undefined
}

const server = createServer((request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost')
  void fileFor(pathname).then(async (file) => {
    const status = file ? 200 : 404
    const body = file ?? join(ROOT, '404.html')
    response.writeHead(status, {
      'content-type': TYPES[extname(body)] ?? 'application/octet-stream',
    })
    response.end(await readFile(body))
  })
})

await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
const address = server.address()
if (address === null || typeof address === 'string') throw new Error('No server address')
const origin = `http://127.0.0.1:${String(address.port)}`

const failures: string[] = []
let passed = 0
function check(name: string, ok: boolean, detail: unknown) {
  if (ok) passed += 1
  else failures.push(`${name}: got ${JSON.stringify(detail)}`)
  console.log(`${ok ? '✓' : '✗'} ${name}`)
}

const browser = await chromium.launch()
const errors: string[] = []

/** A page in a fresh context, its storage seeded before any script runs, its errors collected. */
async function open(
  path: string,
  { seed = {}, width = 1440 }: { seed?: Record<string, string>; width?: number } = {},
): Promise<Page> {
  const context = await browser.newContext({ viewport: { width, height: 1000 } })
  // Seeded once, so a reload shows what the page itself kept.
  await context.addInitScript((entries) => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value)
  }, seed)
  // The theme and mode on <html> when <body> is parsed: before the first paint and hydration.
  await context.addInitScript(() => {
    new MutationObserver((_records, observer) => {
      // `document.body` is typed as always there, but it's null until the parser reaches it.
      if (!(document.body as HTMLElement | null)) return
      const { theme, mode } = document.documentElement.dataset
      Object.assign(window, { firstPaint: { theme, mode } })
      observer.disconnect()
    }).observe(document, { childList: true, subtree: true })
  })
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(`${path}: ${error.message}`))
  page.on('console', (message) => {
    // The 404 page answers with a 404 status, as it should; the browser logs that as an error.
    if (message.type() !== 'error' || message.location().url === origin + path) return
    errors.push(`${path}: ${message.text()}`)
  })
  await page.goto(origin + path)
  return page
}

const attributes = (page: Page) =>
  page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    mode: document.documentElement.dataset.mode,
  }))

try {
  // The sidebar on the docs index: the top-level pages under "Kiln", the sections under
  // "Packages" (nav.labels), each linked to its first page.
  const docs = await open('/docs')
  const pages = await docs
    .getByRole('navigation', { name: 'Kiln', exact: true })
    .getByRole('link')
    .allTextContents()
  check('the sidebar lists the top-level pages under "Kiln"', pages.includes('Introduction'), pages)
  const sections = await docs
    .getByRole('navigation', { name: 'Packages' })
    .getByRole('link')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
  check(
    'the sidebar lists the sections under "Packages", each linked to its first page',
    JSON.stringify(sections) ===
      JSON.stringify([
        '/docs/ui',
        '/docs/forms',
        '/docs/drag-and-drop',
        '/docs/charts',
        '/docs/tooling',
      ]),
    sections,
  )

  // Inside a section: the current page, its open group and the breadcrumb.
  const button = await open('/docs/ui/actions/button')
  const group = button.getByRole('navigation', { name: 'UI: Actions' })
  const current = await group.locator('[aria-current="page"]').textContent()
  check('a page marks itself current in the sidebar', current === 'Button', current)
  const links = await group.getByRole('link').count()
  check("the current page's group is open, named <section>: <group>", links > 1, links)
  const crumbs = await button.locator('article header p').first().textContent()
  check('the breadcrumb starts with the section', crumbs === 'UI / Actions', crumbs)

  // Search: the header's dialog queries the Pagefind index that postbuild wrote (ADR 0049).
  const loaded: string[] = []
  button.on('request', (request) => loaded.push(new URL(request.url()).pathname))
  await button
    .getByRole('button', { name: /Search/ })
    .first()
    .click()
  await button.getByRole('searchbox', { name: 'Search' }).fill('FormSteps')
  const results = button.getByRole('list', { name: 'Results' })
  await results.waitFor()
  const result = await results.getByRole('link').first().getAttribute('href')
  check(
    'search finds FormSteps first in the Pagefind index',
    result === '/docs/forms/layouts/form-steps' && loaded.includes('/pagefind/pagefind.js'),
    { result, pagefind: loaded.filter((path) => path.startsWith('/pagefind/')).length },
  )

  // The picker re-themes the site, stores the pick, and the pick survives a reload.
  await docs.getByRole('combobox', { name: 'Theme' }).click()
  await docs.getByRole('option', { name: 'Riso' }).click()
  const picked = await docs.evaluate(() => [
    document.documentElement.dataset.theme,
    localStorage.getItem('kiln-docs-theme'),
  ])
  check(
    'the picker sets data-theme and stores kiln-docs-theme',
    picked[0] === 'riso' && picked[1] === 'riso',
    picked,
  )
  await docs.reload()
  const reloaded = await attributes(docs)
  check('the picked theme survives a reload', reloaded.theme === 'riso', reloaded)

  // Phone width: the sidebar is behind the menu button, in a sheet with the sections.
  const phone = await open('/docs/ui/actions/button', { width: 390 })
  await phone.getByRole('button', { name: 'Open navigation' }).click()
  const sheet = phone.getByRole('dialog', { name: 'Kiln docs' })
  await sheet.waitFor()
  const sheetCurrent = await sheet.locator('[aria-current="page"]').allTextContents()
  check(
    'the phone sheet holds the sections and the sidebar, the current ones marked',
    JSON.stringify(sheetCurrent) === JSON.stringify(['UI', 'Button']),
    sheetCurrent,
  )

  // ADR 0046: a reader's choices live under four keys that never change. Seeded before load,
  // they apply before the first paint and persist across a reload.
  const reader = await open('/docs/tooling/project-structure', {
    seed: {
      'kiln-docs-theme': 'ledger',
      'kiln-color-mode': 'dark',
      'kiln-docs-variant-router': 'next',
      'kiln-docs-variant-data': 'graphql',
    },
  })
  const firstPaint = await reader.evaluate(() => (window as { firstPaint?: unknown }).firstPaint)
  check(
    'seeded kiln-docs-theme and kiln-color-mode apply before the first paint',
    JSON.stringify(firstPaint) === JSON.stringify({ theme: 'ledger', mode: 'dark' }),
    firstPaint,
  )
  await reader.waitForSelector('[data-docs-variant="router:next"]:not([hidden])')
  const shown = await reader.evaluate(() =>
    [...document.querySelectorAll('[data-docs-variant]:not([hidden])')].map((block) =>
      block.getAttribute('data-docs-variant'),
    ),
  )
  check(
    'seeded kiln-docs-variant-router and kiln-docs-variant-data choose the blocks shown',
    shown.includes('router:next') &&
      shown.includes('data:graphql') &&
      shown.every((variant) => variant === 'router:next' || variant === 'data:graphql'),
    shown,
  )
  await reader.reload()
  const kept = await reader.evaluate(() => [
    document.documentElement.dataset.theme,
    document.documentElement.dataset.mode,
    ...[
      'kiln-docs-theme',
      'kiln-color-mode',
      'kiln-docs-variant-router',
      'kiln-docs-variant-data',
    ].map((key) => localStorage.getItem(key)),
  ])
  check(
    'the four keys persist across a reload',
    JSON.stringify(kept) ===
      JSON.stringify(['ledger', 'dark', 'ledger', 'dark', 'next', 'graphql']),
    kept,
  )

  // axe on the chrome's pages, in light and dark. The landing page's own content is the
  // site's, not the chrome's, so only its header and footer are checked.
  const axeSource = await readFile(AXE, 'utf8')
  for (const [path, exclude] of [
    ['/', ['main']],
    ['/docs', []],
    ['/docs/ui/actions/button', []],
    ['/no-such-page', []],
  ] as const) {
    for (const mode of ['light', 'dark']) {
      const page = await open(path, { seed: { 'kiln-color-mode': mode } })
      await page.addScriptTag({ content: axeSource })
      const violations = await page.evaluate(
        async (excluded) => {
          const { axe } = window as unknown as {
            axe: { run: (context: unknown) => Promise<{ violations: { id: string }[] }> }
          }
          const found = await axe.run({ exclude: excluded.map((selector) => [selector]) })
          return found.violations.map((violation) => violation.id)
        },
        [...exclude],
      )
      check(`axe finds nothing on ${path} in ${mode} mode`, violations.length === 0, violations)
    }
  }

  check('no page errors or console errors', errors.length === 0, errors)
} finally {
  await browser.close()
  server.close()
}

console.log(`${String(passed)} of ${String(passed + failures.length)} checks passed.`)
if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}
