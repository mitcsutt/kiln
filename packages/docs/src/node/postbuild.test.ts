import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { checkPeers, inRange } from './peers.ts'
import { indexPages, moveMarkdown, postbuild } from './postbuild.ts'
import { ROUTE_FILES } from './routes.ts'
import { checkThemeCss, configuredThemes, missingThemes, themeSelector } from './themeCss.ts'

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'kiln-docs-postbuild-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

function write(path: string, content = '') {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
}

const read = (path: string) => readFileSync(join(root, path), 'utf8')

/** A site's root after `next build`: its route files, an export and the fumadocs pair. */
function builtSite({ css = '[data-theme=riso]{--a:1}' } = {}) {
  for (const file of ROUTE_FILES) write(`src/app/${file.path}`, file.content)
  write('out/llms.mdx/index.md', '# Index')
  write('out/llms.mdx/ui/button.md', '# Button')
  write('out/docs/ui/button.html', '<p>Button</p>')
  write('out/api/search', '{"type":"advanced"}')
  write('out/_next/static/chunks/a.css', css)
  write('node_modules/fumadocs-core/package.json', '{"version":"16.15.20"}')
  write('node_modules/fumadocs-mdx/package.json', '{"version":"15.4.6"}')
}

const picker = {
  theme: { picker: ['paper', 'riso'], default: 'paper' },
  search: { provider: 'orama-static' as const },
}

/** An exported docs page, as the chrome renders one: the content is in its article. */
const html = (title: string, body: string) =>
  `<!doctype html><html lang="en"><body><header>Search</header><article><p data-pagefind-meta="crumbs" data-pagefind-ignore>UI / Actions</p><h1>${title}</h1><p>${body}</p><nav data-pagefind-ignore>Next: Pager</nav></article></body></html>`

describe('the theme CSS check', () => {
  // ADR 0045 (T15): built CSS is minified, so `[data-theme='riso']` loses its quotes.
  it('matches a theme selector with or without quotes', () => {
    for (const css of ['[data-theme=riso]', '[data-theme="riso"]', "[data-theme='riso']"]) {
      expect(themeSelector('riso').test(css), css).toBe(true)
    }
    expect(themeSelector('riso').test('[data-theme=risograph]')).toBe(false)
    expect(themeSelector('riso').test('[data-theme="riso\']')).toBe(false)
  })

  it('checks every theme the picker offers but the base theme', () => {
    expect(
      configuredThemes({ theme: { picker: ['paper', 'riso', 'riso'], default: 'paper' } }),
    ).toEqual(['riso'])
    expect(missingThemes(['[data-theme=riso]{}'], ['riso', 'ledger'])).toEqual(['ledger'])
  })

  it('checks a fixed theme, unless it is the base theme', () => {
    expect(configuredThemes({ theme: { fixed: 'flightdeck' } })).toEqual(['flightdeck'])
    expect(configuredThemes({ theme: { fixed: 'paper' } })).toEqual([])
  })

  it("names kiln-ui's preset to import for a built-in theme", () => {
    write('out/_next/static/chunks/a.css', 'body{}')
    write(
      'node_modules/@mitcsutt/kiln-ui/package.json',
      JSON.stringify({
        name: '@mitcsutt/kiln-ui',
        exports: { './themes/riso.css': './riso.css' },
      }),
    )
    write('node_modules/@mitcsutt/kiln-ui/riso.css')
    expect(checkThemeCss(root, join(root, 'out'), picker)).toEqual([
      "The riso theme has no CSS in the export. Add import '@mitcsutt/kiln-ui/themes/riso.css' to the root layout (app/layout.tsx).",
    ])
  })

  it("names the site's own stylesheet for a custom theme", () => {
    write('out/_next/static/chunks/a.css', '[data-theme=riso]{}')
    expect(
      checkThemeCss(root, join(root, 'out'), {
        theme: { picker: ['riso', 'harbour'], default: 'riso' },
      }),
    ).toEqual([
      "The harbour theme has no CSS in the export. Add the stylesheet that defines [data-theme='harbour'] to the root layout (app/layout.tsx).",
    ])
  })
})

describe('the peer check', () => {
  it('reads a tilde range as the same minor, at least that patch', () => {
    expect(inRange('16.15.18', '~16.15.18')).toBe(true)
    expect(inRange('16.15.30', '~16.15.18')).toBe(true)
    expect(inRange('16.15.17', '~16.15.18')).toBe(false)
    expect(inRange('16.17.8', '~16.15.18')).toBe(false)
    expect(inRange('15.4.6', '15.4.6')).toBe(true)
    expect(() => inRange('15.4.6', '^15.4.6')).toThrow("can't compare")
  })

  it('fails on a fumadocs peer outside the tested pair, or missing', () => {
    const ranges = { 'fumadocs-core': '~16.15.18', 'fumadocs-mdx': '~15.4.6' }
    write('node_modules/fumadocs-core/package.json', '{"version":"16.17.8"}')
    expect(checkPeers(root, ranges)).toEqual([
      'fumadocs-core@16.17.8 is installed, but kiln-docs is tested with fumadocs-core@~16.15.18.',
      "fumadocs-mdx isn't installed. kiln-docs needs fumadocs-mdx@~15.4.6.",
    ])
  })
})

describe('postbuild', () => {
  it("moves each page's Markdown to its URL, and the index to /docs.md", async () => {
    builtSite()
    expect((await postbuild({ root, config: picker }))[0]).toBe(
      'moved out/llms.mdx to out/docs/<page>.md and out/docs.md',
    )
    expect(read('out/docs.md')).toBe('# Index')
    expect(read('out/docs/ui/button.md')).toBe('# Button')
    expect(read('out/docs/ui/button.html')).toBe('<p>Button</p>')
    expect(existsSync(join(root, 'out/llms.mdx'))).toBe(false)
  })

  it('fails before next build has run', () => {
    expect(() => {
      moveMarkdown(join(root, 'out'))
    }).toThrow('Run `next build` first.')
  })

  it('fails on a missing route file and a theme with no CSS, naming each', async () => {
    builtSite({ css: 'body{}' })
    rmSync(join(root, 'src/app/robots.ts'))
    await expect(postbuild({ root, config: picker })).rejects.toThrow(
      /2 problem\(s\):\n- src\/app\/robots\.ts is missing\. Write it from the kiln-docs README\.\n- The riso theme has no CSS/,
    )
  })

  it('reads the route files from app/ when the site has no src/app', async () => {
    builtSite()
    rmSync(join(root, 'src'), { recursive: true })
    await expect(postbuild({ root, config: picker })).rejects.toThrow('app/layout.tsx is missing')
  })

  it('keeps the Orama index under orama-static, and writes no Pagefind index', async () => {
    builtSite()
    const log = await postbuild({ root, config: picker })
    expect(log.some((line) => line.includes('Pagefind'))).toBe(false)
    expect(read('out/api/search')).toBe('{"type":"advanced"}')
    expect(existsSync(join(root, 'out/pagefind'))).toBe(false)
  })
})

// ADR 0048: Pagefind, the default provider, indexes the export's docs pages.
describe('the Pagefind index', () => {
  it('indexes the docs pages from their articles, and deletes the search route', async () => {
    builtSite()
    write('out/docs.html', html('Toolbelt', 'Start here.'))
    write('out/docs/ui/button.html', html('Button', 'Presses a thing.'))
    write('out/index.html', html('Landing', 'Not a docs page.'))
    write('out/404.html', html('Not found', 'Not a docs page.'))
    const log = await postbuild({ root, config: { theme: { fixed: 'paper' } } })
    expect(log).toContain('indexed 2 pages with Pagefind in out/pagefind')
    expect(existsSync(join(root, 'out/pagefind/pagefind.js'))).toBe(true)
    expect(existsSync(join(root, 'out/pagefind/pagefind-ui.js'))).toBe(false)
    expect(existsSync(join(root, 'out/api'))).toBe(false)
    const entry = JSON.parse(read('out/pagefind/pagefind-entry.json')) as {
      languages: Record<string, { page_count: number }>
    }
    expect(entry.languages.en?.page_count).toBe(2)
  }, 30_000)

  it('fails when the export has no docs pages', async () => {
    write('out/index.html', html('Landing', 'Not a docs page.'))
    await expect(indexPages(join(root, 'out'))).rejects.toThrow(
      `Pagefind found no docs pages in ${join(root, 'out')}. Run \`next build\` first.`,
    )
  }, 30_000)
})
