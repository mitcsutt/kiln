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
  it('cover the route handlers and the SEO routes', () => {
    expect(ROUTE_FILES.map((file) => file.path)).toEqual([
      'api/search/route.ts',
      'llms.txt/route.ts',
      'llms-full.txt/route.ts',
      'llms.mdx/[...slug]/route.ts',
      'sitemap.ts',
      'robots.ts',
    ])
  })

  it('each carry an unedited stamp', () => {
    for (const file of ROUTE_FILES) {
      expect(file.content).toMatch(/^\/\/ kiln-docs route v1 [0-9a-f]{12}: /)
      expect(readStamp(file.content)).toMatchObject({ format: 'v1', edited: false })
    }
  })

  // Next.js ignores re-exported segment config, so the literal is in each file (ADR 0045).
  it("each hold export const dynamic = 'force-static' themselves", () => {
    for (const file of ROUTE_FILES) {
      expect(file.content).toContain("\nexport const dynamic = 'force-static'\n")
    }
  })

  it('re-export members createDocsSite returns', () => {
    const site = createDocsSite({
      config: testConfig,
      collections: { docs: collection(page('index.md')) },
    })
    const routes: Record<string, unknown> = site.routes
    // `export const { GET } = site.routes.search`, or `export default site.routes.sitemap`.
    const exported = ROUTE_FILES.flatMap(({ path, content }) => {
      const match = /export (?:const \{ ([^}]+) \} =|default) site\.routes\.(\w+)/.exec(content)
      const [, names, member = ''] = match ?? []
      const route = routes[member] as Record<string, unknown> | undefined
      return names
        ? names.split(', ').map((name) => [`${path}: ${member}.${name}`, typeof route?.[name]])
        : [[`${path}: ${member}`, typeof route]]
    })
    expect(exported).toEqual(exported.map(([name]) => [name, 'function']))
  })
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
