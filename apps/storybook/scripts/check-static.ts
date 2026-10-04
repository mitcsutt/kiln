/**
 * Proves the static build works when served under `/storybook/`, the path it is meant
 * for (`kiln.mitchellsutton.com/storybook`, ADR 0009). Run it after `pnpm build`:
 *
 *   node scripts/check-static.ts
 *
 * It serves `storybook-static/` at `/storybook/` (and nothing at `/`), then loads the
 * manager and a story in Chromium. Any request that fails or answers 4xx/5xx, any page
 * error, or a story that doesn't render fails the check.
 */
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

import { chromium } from 'playwright'

const BASE = '/storybook/'
const ROOT = join(import.meta.dirname, '..', 'storybook-static')
const STORY = 'ui-actions-button--playground'

const TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

async function fileFor(pathname: string): Promise<string | undefined> {
  if (!pathname.startsWith(BASE)) return undefined
  const relative = normalize(decodeURIComponent(pathname.slice(BASE.length)) || 'index.html')
  if (relative.startsWith('..')) return undefined
  const file = join(ROOT, relative)
  try {
    return (await stat(file)).isFile() ? file : undefined
  } catch {
    return undefined
  }
}

const server = createServer((request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost')
  void fileFor(pathname).then(async (file) => {
    if (!file) {
      response.writeHead(404).end()
      return
    }
    response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
    response.end(await readFile(file))
  })
})

await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
const address = server.address()
if (address === null || typeof address === 'string') throw new Error('No server address')
const origin = `http://127.0.0.1:${String(address.port)}`

const failures: string[] = []
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  page.on('pageerror', (error) => failures.push(`page error: ${error.message}`))
  page.on('requestfailed', (request) => {
    // Storybook cancels in-flight requests when it navigates the preview; only a
    // failure for a file we serve counts.
    if (request.url().startsWith(origin)) failures.push(`failed: ${request.url()}`)
  })
  page.on('response', (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) {
      failures.push(`${String(response.status())}: ${response.url()}`)
    }
  })

  const index = await page.request.get(`${origin}${BASE}index.json`)
  const entries = Object.keys(((await index.json()) as { entries: object }).entries).length
  if (entries < 500) failures.push(`index.json lists ${String(entries)} entries`)

  await page.goto(`${origin}${BASE}?path=/story/${STORY}`)
  const preview = page.frameLocator('#storybook-preview-iframe')
  await preview.getByRole('button', { name: 'Publish fixtures' }).waitFor({ timeout: 30_000 })
  await page.waitForLoadState('networkidle')

  console.log(`Served at ${BASE}: ${String(entries)} index entries, ${STORY} rendered.`)
} finally {
  await browser.close()
  server.close()
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}
