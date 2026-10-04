import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { allApi } from '@/lib/api'
import { contentDir, contentPages, storyTitles, titleToPath } from './content'

const pages = contentPages()
const paths = new Set(pages.map((page) => page.path))
const pagePath = (path: string) => (paths.has(path) ? path : `${path}/index`)

// ADR 0010: the docs sidebar and Storybook share one tree. A story's title is its page's path.
describe('one tree for the docs and Storybook', () => {
  const stories = storyTitles()

  it('finds the stories', () => {
    expect(stories.length).toBeGreaterThan(150)
  })

  it.each(stories)('$title has a docs page', ({ title }) => {
    expect(paths.has(pagePath(titleToPath(title)))).toBe(true)
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
  it.each(pages)('$path uses examples that exist', ({ body }) => {
    for (const match of body.matchAll(/<Example\b[^>]*\bname="([^"]+)"/g)) {
      expect(existsSync(join(contentDir, '../../examples', `${match[1] ?? ''}.tsx`))).toBe(true)
    }
  })
})
