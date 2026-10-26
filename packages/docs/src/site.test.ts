import type { StaticSource } from 'fumadocs-core/source'
import type { SiteConfig } from './config.ts'
import { createDocsSite, DOCS_BASE_URL } from './site.ts'

const config = { name: 'Toolbelt' } as SiteConfig

const page = (path: string, title = path) => ({ type: 'page' as const, path, data: { title } })
const meta = (path: string, pages: string[]) => ({
  type: 'meta' as const,
  path,
  data: { pages },
})

type File = ReturnType<typeof page> | ReturnType<typeof meta>
const collection = (...files: File[]) => ({
  toFumadocsSource: (): StaticSource => ({ files }),
})

/** The site over hand-written and generated files, with the title each URL publishes. */
function publish(handWritten: File[], generated?: File[]) {
  const { source } = createDocsSite({
    config,
    collections: {
      docs: collection(...handWritten),
      ...(generated && { generated: collection(...generated) }),
    },
  })
  return Object.fromEntries(source.getPages().map((entry) => [entry.url, entry.data.title]))
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createDocsSite', () => {
  it('returns the config with a loader for the docs at /docs', () => {
    const site = createDocsSite({ config, collections: { docs: collection(page('index.mdx')) } })
    expect(site.config).toBe(config)
    expect(DOCS_BASE_URL).toBe('/docs')
    expect(site.source.getPages().map((entry) => entry.url)).toEqual(['/docs'])
  })

  it('publishes the generated pages beside the hand-written ones', () => {
    expect(
      publish(
        [page('index.mdx'), page('plugins/index.mdx'), meta('plugins/meta.json', ['git', 'gh'])],
        [page('plugins/git.md'), page('plugins/gh.md')],
      ),
    ).toEqual({
      '/docs': 'index.mdx',
      '/docs/plugins': 'plugins/index.mdx',
      '/docs/plugins/git': 'plugins/git.md',
      '/docs/plugins/gh': 'plugins/gh.md',
    })
  })

  it('lists the pages of both collections in one order, by file path', () => {
    const { source } = createDocsSite({
      config,
      collections: {
        docs: collection(page('b.mdx'), page('index.mdx')),
        generated: collection(page('c.md'), page('a.md')),
      },
    })
    expect(source.getPages().map((entry) => entry.path)).toEqual([
      'a.md',
      'b.mdx',
      'c.md',
      'index.mdx',
    ])
  })

  // ADR 0045: left to Fumadocs, a hand-written `.mdx` over a generated `.md` index publishes the
  // generated page and moves the hand-written one to `/x/index`, and over a leaf throws.
  describe.each([
    ['.mdx', '.md'],
    ['.md', '.mdx'],
    ['.mdx', '.mdx'],
    ['.md', '.md'],
  ])('a hand-written %s page over a generated %s page', (handWritten, generated) => {
    it('wins on an index page', () => {
      expect(
        publish(
          [page(`plugins/git/index${handWritten}`, 'hand-written')],
          [page(`plugins/git/index${generated}`, 'generated')],
        ),
      ).toEqual({ '/docs/plugins/git': 'hand-written' })
    })

    it('wins on a leaf page', () => {
      expect(
        publish(
          [page(`plugins/git${handWritten}`, 'hand-written')],
          [page(`plugins/git${generated}`, 'generated')],
        ),
      ).toEqual({ '/docs/plugins/git': 'hand-written' })
    })

    it('reports the generated page it skips', () => {
      publish([page(`git${handWritten}`)], [page(`git${generated}`)])
      expect(console.warn).toHaveBeenCalledExactlyOnceWith(
        `kiln-docs: skipped the generated git${generated}: the hand-written git${handWritten} takes its place.`,
      )
    })
  })

  it('keeps the hand-written meta file over a generated one at its path', () => {
    const { source } = createDocsSite({
      config,
      collections: {
        docs: collection(page('a/x.mdx'), page('a/y.mdx'), meta('a/meta.json', ['y', 'x'])),
        generated: collection(meta('a/meta.json', ['x', 'y'])),
      },
    })
    const [folder] = source.pageTree.children
    expect(folder?.type === 'folder' && folder.children.map((node) => node.name)).toEqual([
      'a/y.mdx',
      'a/x.mdx',
    ])
    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      'kiln-docs: skipped the generated a/meta.json: the hand-written a/meta.json takes its place.',
    )
  })

  it('fails on two generated pages with one slug', () => {
    expect(() => publish([], [page('git/index.md'), page('git/index.mdx')])).toThrow(
      'kiln-docs: git/index.md and git/index.mdx in the generated pages are one page, git/index. Keep one of them.',
    )
    expect(() => publish([], [page('git.md'), page('git.mdx')])).toThrow('one page, git.')
  })

  it('fails on two hand-written pages with one slug', () => {
    expect(() => publish([page('git/index.md'), page('git/index.mdx')])).toThrow(
      'kiln-docs: git/index.md and git/index.mdx in the hand-written pages are one page, git/index. Keep one of them.',
    )
  })
})
