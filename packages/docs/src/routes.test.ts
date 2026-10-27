import type { SearchProvider } from './config.ts'
import { collection, page, testConfig } from './fixtures.ts'
import { createSearchRoute } from './search.ts'
import { searchClient } from './searchClient.ts'
import { createDocsSite } from './site.ts'

/** A page with what the Markdown routes and the search index read. */
const doc = (path: string, title: string, body: string, description?: string) =>
  page(path, title, {
    description,
    getText: () => Promise.resolve(body),
    structuredData: { headings: [], contents: [{ heading: undefined, content: body }] },
  })

const site = createDocsSite({
  config: testConfig,
  collections: {
    docs: collection(
      doc('index.md', 'Toolbelt', 'Start here.'),
      doc('plugins/git.md', 'git', 'Commits.', 'Git helpers.'),
    ),
  },
})

const params = <Params>(value: Params) => ({ params: Promise.resolve(value) })

describe("createDocsSite's routes", () => {
  it('serve llms.txt and llms-full.txt as Markdown', async () => {
    const index = site.routes.llmsTxt.GET()
    expect(index.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    expect(await index.text()).toContain(
      '- [git](https://toolbelt.example.com/docs/plugins/git.md): Git helpers.',
    )
    const full = await site.routes.llmsFullTxt.GET()
    expect((await full.text()).split('\n---\n\n')).toHaveLength(2)
  })

  it("serve each page's Markdown, and the index's as index.md", async () => {
    const { pageMarkdown } = site.routes
    expect(pageMarkdown.generateStaticParams()).toEqual([
      { slug: ['index.md'] },
      { slug: ['plugins', 'git.md'] },
    ])
    const git = await pageMarkdown.GET(
      new Request('https://x'),
      params({ slug: ['plugins', 'git.md'] }),
    )
    expect(await git.text()).toBe(
      '# git\n\n> Git helpers.\n\nSource: https://toolbelt.example.com/docs/plugins/git\n\nCommits.\n',
    )
    const index = await pageMarkdown.GET(new Request('https://x'), params({ slug: ['index.md'] }))
    expect(await index.text()).toContain('Source: https://toolbelt.example.com/docs\n')
  })

  it("404 on a page that doesn't exist, or a path without .md", async () => {
    const { GET } = site.routes.pageMarkdown
    await expect(GET(new Request('https://x'), params({ slug: ['nope.md'] }))).rejects.toThrow()
    await expect(
      GET(new Request('https://x'), params({ slug: ['plugins', 'git'] })),
    ).rejects.toThrow()
  })

  it("give a docs page its metadata, and 404 on one that doesn't exist", async () => {
    await expect(
      site.generateMetadata(params({ slug: ['plugins', 'git'] })),
    ).resolves.toMatchObject({
      title: 'git',
      alternates: { canonical: 'https://toolbelt.example.com/docs/plugins/git' },
    })
    await expect(site.generateMetadata(params({ slug: [] }))).resolves.toMatchObject({
      title: { absolute: 'Toolbelt' },
    })
    await expect(site.generateMetadata(params({ slug: ['nope'] }))).rejects.toThrow()
  })

  it('give the root layout its metadata from site.url', () => {
    expect(site.metadata.metadataBase).toEqual(new URL('https://toolbelt.example.com'))
  })

  it('list every page in the sitemap, and name it in robots.txt', () => {
    expect(site.routes.sitemap().map((entry) => entry.url)).toEqual([
      'https://toolbelt.example.com/',
      'https://toolbelt.example.com/docs',
      'https://toolbelt.example.com/docs/plugins/git',
    ])
    expect(site.routes.robots().sitemap).toBe('https://toolbelt.example.com/sitemap.xml')
  })
})

describe('the search seam', () => {
  const orama = createDocsSite({
    config: { ...testConfig, search: { placeholder: 'Search', provider: 'orama-static' } },
    collections: { docs: collection(doc('plugins/git.md', 'git', 'Commits.', 'Git helpers.')) },
  })

  /** Runs `body` with `NODE_ENV` set, as `next dev` or `next build` sets it. */
  async function under(env: 'development' | 'production', body: () => Promise<void>) {
    vi.stubEnv('NODE_ENV', env)
    try {
      await body()
    } finally {
      vi.unstubAllEnvs()
    }
  }

  /**
   * What the client finds for "git", serving the Orama index on any fetch, or why it failed. The
   * Orama client keeps the index it fetched, so only the first search fetches it.
   */
  async function searchGit(provider?: SearchProvider): Promise<string[] | string> {
    const index = await (await orama.routes.search.GET()).text()
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(index))),
    )
    try {
      const results = await searchClient(provider).search('git')
      return [...new Set(results.map((result) => result.url))]
    } catch (error) {
      return String(error)
    } finally {
      vi.unstubAllGlobals()
    }
  }

  it('exports the static index under orama-static, in a build', async () => {
    await under('production', async () => {
      const exported = (await (await orama.routes.search.GET()).json()) as { type: string }
      expect(exported.type).toBe('advanced')
      expect(JSON.stringify(exported)).toContain('Commits.')
    })
  })

  it('serves no index in a build under Pagefind, the default', async () => {
    await under('production', async () => {
      const response = await site.routes.search.GET()
      expect(response.status).toBe(404)
      expect(await response.text()).toBe('kiln-docs: search runs on Pagefind, in /pagefind/.')
    })
  })

  it('serves the static index under next dev with Pagefind, which has no build to index', async () => {
    await under('development', async () => {
      const exported = (await (await site.routes.search.GET()).json()) as { type: string }
      expect(exported.type).toBe('advanced')
      expect(JSON.stringify(exported)).toContain('Commits.')
    })
  })

  it("searches Pagefind's index from the export in a build, and the search route under next dev", async () => {
    await under('production', async () => {
      // There's no export here, so the import fails, naming what it tried to load.
      expect(await searchGit()).toContain('/pagefind/pagefind.js')
      expect(await searchGit('orama-static')).toEqual(['/docs/plugins/git'])
    })
    await under('development', async () => {
      expect(await searchGit()).toEqual(['/docs/plugins/git'])
    })
  })

  it('fails on a provider it does not know', () => {
    const unknown = 'algolia' as SearchProvider
    expect(() => createSearchRoute(site.source, unknown)).toThrow(
      "kiln-docs: search.provider algolia isn't a search provider.",
    )
    expect(() => searchClient(unknown)).toThrow(
      "kiln-docs: search.provider algolia isn't a search provider.",
    )
  })
})
