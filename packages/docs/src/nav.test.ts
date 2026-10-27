import type * as PageTree from 'fumadocs-core/page-tree'
import type { SiteConfig } from './config.ts'
import { collection, meta, page as doc, testConfig } from './fixtures.ts'
import { sectionOf, sidebarOf, type Sidebar } from './nav.ts'
import { createDocsSite } from './site.ts'

const config = { name: 'Kiln', nav: { sections: [] } } satisfies Pick<SiteConfig, 'name' | 'nav'>

const page = (url: string, name: string): PageTree.Item => ({ type: 'page', url, name })

/** Kiln's shape: an Introduction, then sections marked `"root": true`. */
const kiln: PageTree.Root = {
  name: 'Docs',
  children: [
    page('/docs', 'Introduction'),
    {
      type: 'folder',
      name: 'UI',
      root: true,
      description: 'Components',
      index: page('/docs/ui', 'Getting started'),
      children: [
        page('/docs/ui/theming', 'Theming'),
        {
          type: 'folder',
          name: 'Inputs',
          children: [
            page('/docs/ui/inputs/input', 'Input'),
            { type: 'separator', name: 'Pickers' },
            page('/docs/ui/inputs/date', 'Date picker'),
          ],
        },
      ],
    },
    {
      type: 'folder',
      name: 'Forms',
      root: true,
      children: [page('/docs/forms/overview', 'Overview')],
    },
  ],
}

/** Every URL the sidebar on `url` links to. */
function links(sidebar: Sidebar): string[] {
  return [
    ...sidebar.pages.map((item) => item.url),
    ...sidebar.groups.flatMap((group) =>
      group.runs.flatMap((run) => run.pages.map((item) => item.url)),
    ),
    ...sidebar.sections.items.map((section) => section.url),
  ]
}

/** Every page a reader can reach from `start` by following sidebar links. */
function reachable(tree: PageTree.Root, start: string): Set<string> {
  const seen = new Set([start])
  const queue = [start]
  for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
    for (const next of links(sidebarOf(tree, url, config))) {
      if (!seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }
  return seen
}

describe('sidebarOf', () => {
  it('lists the section a page is in, with its folders as groups in runs', () => {
    const sidebar = sidebarOf(kiln, '/docs/ui/inputs/date', config)
    expect(sidebar.section?.name).toBe('UI')
    expect(sidebar.label).toBe('UI')
    expect(sidebar.pages.map((item) => item.url)).toEqual(['/docs/ui', '/docs/ui/theming'])
    expect(sidebar.groups.map((group) => [group.name, group.runs])).toEqual([
      [
        'Inputs',
        [
          { label: undefined, pages: [page('/docs/ui/inputs/input', 'Input')] },
          { label: 'Pickers', pages: [page('/docs/ui/inputs/date', 'Date picker')] },
        ],
      ],
    ])
    expect(sidebar.sections.items).toEqual([])
  })

  it('lists the top-level pages and the sections outside one, under the labels in config', () => {
    const sidebar = sidebarOf(kiln, '/docs', {
      ...config,
      nav: { sections: [], labels: { pages: 'Kiln', sections: 'Packages' } },
    })
    expect(sidebar.section).toBeUndefined()
    expect(sidebar.label).toBe('Kiln')
    expect(sidebar.pages.map((item) => item.url)).toEqual(['/docs'])
    expect(sidebar.groups).toEqual([])
    expect(sidebar.sections.label).toBe('Packages')
    expect(
      sidebar.sections.items.map(({ name, url, description }) => ({ name, url, description })),
    ).toEqual([
      { name: 'UI', url: '/docs/ui', description: 'Components' },
      // No index: the section links to its first page.
      { name: 'Forms', url: '/docs/forms/overview', description: undefined },
    ])
  })

  it("names the lists after the site and 'Sections' by default", () => {
    const sidebar = sidebarOf(kiln, '/docs', { name: 'Toolbelt', nav: { sections: [] } })
    expect([sidebar.label, sidebar.sections.label]).toEqual(['Toolbelt', 'Sections'])
  })

  it('reaches every page of a tree with sections', () => {
    expect([...reachable(kiln, '/docs')].sort()).toEqual(
      [
        '/docs',
        '/docs/forms/overview',
        '/docs/ui',
        '/docs/ui/inputs/date',
        '/docs/ui/inputs/input',
        '/docs/ui/theming',
      ].sort(),
    )
  })

  // ADR 0046 (T17): a site whose generated `meta.json` files mark no section, like toolbelt's,
  // showed only the one page the reader was on.
  describe('a tree without sections', () => {
    const { source } = createDocsSite({
      config: testConfig,
      collections: {
        docs: collection(
          doc('index.md', 'Introduction'),
          doc('install.md', 'Install'),
          meta('plugins/meta.json', { title: 'Plugins' }),
          doc('plugins/index.md', 'Plugins'),
          doc('plugins/git/index.md', 'git'),
          doc('plugins/git/skills/commit.md', 'commit'),
          doc('plugins/git/skills/review.md', 'review'),
          doc('plugins/git/agents/reviewer.md', 'reviewer'),
          doc('plugins/gh/index.md', 'gh'),
          meta('rules/meta.json', { title: 'Rules', pages: ['---Personal---', 'style', 'tone'] }),
          doc('rules/style.md', 'Style'),
          doc('rules/tone.md', 'Tone'),
        ),
      },
    })
    const tree = source.getPageTree()
    const urls = source.getPages().map((entry) => entry.url)

    it('has no sections', () => {
      expect(urls.map((url) => sectionOf(tree, url))).toEqual(urls.map(() => undefined))
    })

    it.each(urls)('lists every page on %s', (url) => {
      expect(links(sidebarOf(tree, url, config)).sort()).toEqual([...urls].sort())
    })

    it('lists a folder inside a group as a run named by its path', () => {
      const plugins = sidebarOf(tree, '/docs', config).groups.find(
        (group) => group.name === 'Plugins',
      )
      expect(plugins?.runs.map((run) => [run.label, run.pages.map((item) => item.url)])).toEqual([
        [undefined, ['/docs/plugins']],
        ['gh', ['/docs/plugins/gh']],
        ['git', ['/docs/plugins/git']],
        ['git / Agents', ['/docs/plugins/git/agents/reviewer']],
        ['git / Skills', ['/docs/plugins/git/skills/commit', '/docs/plugins/git/skills/review']],
      ])
    })

    it('labels the runs at separators', () => {
      const rules = sidebarOf(tree, '/docs', config).groups.find((group) => group.name === 'Rules')
      expect(rules?.runs.map((run) => run.label)).toEqual(['Personal'])
    })
  })
})
