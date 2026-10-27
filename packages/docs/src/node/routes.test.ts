import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { collection, page, testConfig } from '../fixtures.ts'
import { createDocsSite } from '../site.ts'
import { checkRouteFiles, readStamp, ROUTE_FILES, stamped } from './routes.ts'

let app: string

beforeEach(() => {
  app = mkdtempSync(join(tmpdir(), 'kiln-docs-routes-'))
})

afterEach(() => {
  rmSync(app, { recursive: true, force: true })
})

function write(path: string, content: string) {
  mkdirSync(dirname(join(app, path)), { recursive: true })
  writeFileSync(join(app, path), content)
}

const writeAll = () => {
  for (const file of ROUTE_FILES) write(file.path, file.content)
}

const stateOf = (path: string) => checkRouteFiles(app).find((file) => file.path === path)?.state

describe('the route files', () => {
  it('cover the route handlers, the SEO routes and the layouts and pages', () => {
    expect(ROUTE_FILES.map((file) => file.path)).toEqual([
      'api/search/route.ts',
      'llms.txt/route.ts',
      'llms-full.txt/route.ts',
      'llms.mdx/[...slug]/route.ts',
      'sitemap.ts',
      'robots.ts',
      'layout.tsx',
      'not-found.tsx',
      'docs/layout.tsx',
      'docs/[[...slug]]/page.tsx',
    ])
  })

  it("import the root layout's stylesheets, kiln-ui's first", () => {
    const layout = ROUTE_FILES.find((file) => file.path === 'layout.tsx')?.content ?? ''
    expect(layout).toContain(
      "import '@mitcsutt/kiln-ui/styles.css'\nimport '@mitcsutt/kiln-docs/styles.css'\n",
    )
  })

  it('each carry an unedited stamp', () => {
    for (const file of ROUTE_FILES) {
      expect(file.content).toMatch(/^\/\/ kiln-docs route v1 [0-9a-f]{12}: /)
      expect(readStamp(file.content)).toMatchObject({ format: 'v1', edited: false })
    }
  })

  // Next.js ignores re-exported segment config, so the literal is in each file (ADR 0045).
  it("each handler holds export const dynamic = 'force-static' itself", () => {
    for (const file of ROUTE_FILES.filter(({ path }) => path.endsWith('.ts'))) {
      expect(file.content).toContain("\nexport const dynamic = 'force-static'\n")
    }
  })

  // The dynamic imports below load the layout entries, which pull kiln-ui source and its Shiki
  // highlighter: slow on a cold CI runner, so this test gets a longer timeout than the default.
  it(
    'use only members createDocsSite returns and the entries kiln-docs exports',
    { timeout: 60_000 },
    async () => {
      const site = createDocsSite({
        config: testConfig,
        collections: { docs: collection(page('index.md')) },
      })
      /** `site.routes.search` → the member it names. */
      const member = (path: string) =>
        path
          .split('.')
          .slice(1)
          .reduce<unknown>((value, key) => (value as Record<string, unknown>)[key], site)
      const used: [string, string][] = []
      for (const { path, content } of ROUTE_FILES) {
        // `export const { GET } = site.routes.search`, `export default site.routes.sitemap`, or
        // `export const metadata = site.metadata`.
        for (const [, names, , from = ''] of content.matchAll(
          /^export (?:const \{ ([^}]+) \} = |const (\w+) = |default )(site[.\w]*)$/gm,
        )) {
          for (const name of names ? names.split(', ').map((name) => `${from}.${name}`) : [from]) {
            used.push([`${path}: ${name}`, typeof member(name)])
          }
        }
        // `import { createDocsPage } from '@mitcsutt/kiln-docs/docs-page'`, and the re-export form.
        for (const [, binding = '', entry = ''] of content.matchAll(
          /^(?:import|export) \{ (\w+)[^}]* \} from '(@mitcsutt\/kiln-docs[^']*)'$/gm,
        )) {
          const exported = (await import(entry)) as Record<string, unknown>
          used.push([`${path}: ${entry} ${binding}`, typeof exported[binding]])
        }
      }
      expect(used.map(([name]) => name)).toContain(
        'layout.tsx: @mitcsutt/kiln-docs/layout createRootLayout',
      )
      expect(used).toEqual(
        used.map(([name]) => [name, name.endsWith('site.metadata') ? 'object' : 'function']),
      )
    },
  )
})

describe('checkRouteFiles', () => {
  it('finds every file current when the site wrote them as they are', () => {
    writeAll()
    expect(checkRouteFiles(app).map((file) => file.state)).toEqual(ROUTE_FILES.map(() => 'current'))
  })

  it('finds a missing file', () => {
    writeAll()
    rmSync(join(app, 'robots.ts'))
    expect(stateOf('robots.ts')).toBe('missing')
  })

  it('finds a file the site edited, or wrote without a stamp', () => {
    writeAll()
    const [first] = ROUTE_FILES
    write('sitemap.ts', `${String(first?.content)}// The site's own line.\n`)
    write('robots.ts', "export { default } from '@/lib/robots'\n")
    expect([stateOf('sitemap.ts'), stateOf('robots.ts')]).toEqual(['edited', 'edited'])
  })

  it('finds an unedited file from an older template stale, so sync may replace it', () => {
    writeAll()
    write('robots.ts', stamped("export { robots as default } from '@/lib/site'\n"))
    expect(stateOf('robots.ts')).toBe('stale')
  })
})
