import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { allApi } from '@/lib/api'
import { contentDir, contentPages, repoDir, storyTitles, titleToPath } from './content'

const pages = contentPages()
const paths = new Set(pages.map((page) => page.path))
const pagePath = (path: string) => (paths.has(path) ? path : `${path}/index`)

// ADR 0010: the docs sidebar and Storybook share one tree. A story's title is its page's path.
describe('one tree for the docs and Storybook', () => {
  const stories = storyTitles()

  it('finds the stories', () => {
    expect(stories.length).toBeGreaterThan(150)
  })

  // A title is a page (`UI/Actions/Button`), or a docs folder whose stories are its pages
  // (`UI/Themes` with stories `Paper`, `Fiesta`…, which Storybook lists as `UI/Themes/Paper`).
  it.each(stories)('$title has a docs page', ({ title, stories: names }) => {
    const path = titleToPath(title)
    if (paths.has(pagePath(path))) return
    expect(names.length, `${path} is neither a page nor a folder of pages`).toBeGreaterThan(0)
    for (const name of names) expect(paths.has(`${path}/${titleToPath(name)}`), name).toBe(true)
  })

  // docs/tree.json is the 0010 tree, which Storybook's tree test reads too.
  it('has the sidebar groups of docs/tree.json, in order', () => {
    const tree = JSON.parse(readFileSync(join(repoDir, 'docs/tree.json'), 'utf8')) as Record<
      string,
      string[]
    >
    const meta = (dir: string) =>
      JSON.parse(readFileSync(join(contentDir, dir, 'meta.json'), 'utf8')) as {
        title?: string
        pages?: string[]
      }
    const titleOf = (dir: string, slug: string) =>
      existsSync(join(contentDir, dir, slug, 'meta.json'))
        ? meta(join(dir, slug)).title
        : pages.find((page) => page.path === `${dir}/${slug}`)?.frontmatter.title
    const sidebar: Record<string, (string | undefined)[]> = Object.fromEntries(
      (meta('.').pages ?? [])
        .filter((slug) => slug !== 'index')
        .map((slug): [string, (string | undefined)[]] => [
          meta(slug).title ?? slug,
          (meta(slug).pages ?? [])
            .filter((child) => child !== 'index')
            .map((child) => titleOf(slug, child)),
        ]),
    )
    expect(sidebar).toEqual(tree)
  })

  it('nests every docs page under UI, Forms or Tooling', () => {
    const stray = pages
      .map((page) => page.path)
      .filter((path) => path !== 'index' && !/^(ui|forms|tooling)(\/|$)/.test(path))
    expect(stray).toEqual([])
  })
})

describe('every export with behaviour has a page', () => {
  const documented = new Map<string, string>()
  for (const page of pages) {
    for (const name of page.frontmatter.exports ?? []) documented.set(name, page.path)
  }

  // Components, hooks and functions, and the bound fields (constants made by `defineField`).
  // The icons share one page, which names `createIcon`.
  const needsPage = allApi().filter(
    (entry) =>
      (entry.kind === 'component' && !entry.name.endsWith('Icon')) ||
      entry.kind === 'function' ||
      /^Form\w+Field$/.test(entry.name),
  )

  it.each(needsPage)('$name is documented', (entry) => {
    expect(documented.get(entry.name), `${entry.package} ${entry.name}`).toBeDefined()
  })

  it('names only real exports', () => {
    const known = new Set(allApi().map((entry) => entry.name))
    expect([...documented.keys()].filter((name) => !known.has(name))).toEqual([])
  })
})

describe('page references', () => {
  const known = new Set(allApi().map((entry) => entry.name))

  it.each(pages)('$path names real exports in its API tables', ({ body }) => {
    const named = [...body.matchAll(/<Api(?:Table|Signature)\b[^>]*\bof="([^"]+)"/g)].flatMap(
      (match) => (match[1] ?? '').split(',').map((name) => name.trim()),
    )
    expect(named.filter((name) => !known.has(name))).toEqual([])
  })

  it.each(pages)('$path uses examples that exist', ({ body }) => {
    for (const match of body.matchAll(/<Example\b[^>]*\bname="([^"]+)"/g)) {
      expect(existsSync(join(contentDir, '../../examples', `${match[1] ?? ''}.tsx`))).toBe(true)
    }
  })
})
