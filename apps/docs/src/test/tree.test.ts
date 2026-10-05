import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { allApi } from '@/lib/api'
import { docsStories, docsStoriesOwners, exampleId, exampleIds } from '@/lib/examples'
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
    // A guide's stories file that holds only docs stories (`Forms/Getting started/First form`)
    // is shown on other pages, which the 'shows every docs story on a page' check covers.
    const docs = docsStoriesOwners().includes(path) ? docsStories(path) : []
    if (docs.length && names.every((name) => docs.some((story) => story.name === name))) return
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
    expect(exampleProblems(body, { exports: known, ids: exampleIds() })).toEqual([])
  })

  it('names each stories file with docs stories after a public export, or a guide by its path', () => {
    expect(docsStoriesOwners().filter((of) => !of.includes('/') && !known.has(of))).toEqual([])
  })

  // ADR 0028: a story tagged `docs` is written for the docs site, so a page must show it.
  it('shows every docs story on a page', () => {
    const shown = new Set<string>()
    for (const { body } of pages) {
      for (const [, of = ''] of body.matchAll(/<Examples\b[^>]*\bof="([^"]*)"/g)) {
        for (const { name } of docsStories(of)) shown.add(exampleId({ of, name }))
      }
      for (const [tag] of body.matchAll(/<Example\b[^>]*\/>/g)) {
        const of = /\bof="([^"]*)"/.exec(tag)?.[1]
        const name = /\bname="([^"]*)"/.exec(tag)?.[1]
        if (of) shown.add(exampleId({ of, name }))
      }
    }
    const unshown = docsStoriesOwners().flatMap((of) =>
      docsStories(of)
        .map(({ name }) => exampleId({ of, name }))
        .filter((id) => !shown.has(id)),
    )
    expect(unshown).toEqual([])
  })
})

/**
 * What's wrong with a page's `<Example />` and `<Examples />` tags (ADR 0028). `of` names a
 * public export whose stories file has docs stories, or a guide's stories file by its path, and
 * `name` is one of that file's docs stories.
 */
function exampleProblems(body: string, { exports, ids }: { exports: Set<string>; ids: string[] }) {
  const known = new Set(ids)
  const files = new Set(ids.flatMap((id) => (id.includes('#') ? id.split('#', 1) : [])))
  const problems: string[] = []
  for (const [tag] of body.matchAll(/<Examples\b[^>]*\/>/g)) {
    const of = /\bof="([^"]*)"/.exec(tag)?.[1]
    if (of === undefined) problems.push(`${tag}: no \`of\``)
    else if (!docsStoriesOwners().includes(of)) problems.push(`${tag}: ${of} has no docs stories`)
  }
  for (const [tag] of body.matchAll(/<Example\b[^>]*\/>/g)) {
    const of = /\bof="([^"]*)"/.exec(tag)?.[1]
    const name = /\bname="([^"]*)"/.exec(tag)?.[1]
    if (of === undefined) {
      problems.push(`${tag}: no \`of\``)
    } else if (!of.includes('/') && !exports.has(of)) {
      problems.push(`${tag}: ${of} isn't a public export`)
    } else if (!files.has(of)) {
      problems.push(`${tag}: ${of} has no docs stories`)
    } else if (!known.has(exampleId({ of, name }))) {
      problems.push(`${tag}: ${of} has no docs story ${name ?? 'Usage'}`)
    }
  }
  return problems
}

describe('exampleProblems', () => {
  const check = (body: string) =>
    exampleProblems(body, {
      exports: new Set(['Button', 'Card']),
      ids: ['Button#Usage', 'Button#Hierarchy', 'forms/getting-started/schemas#Usage'],
    })

  it('accepts an export and a guide path', () => {
    expect(
      check(`<Example of="Button" />
<Example of="Button" name="Hierarchy" layout="bleed" />
<Example name="Hierarchy" of="Button" />
<Example of="forms/getting-started/schemas" />`),
    ).toEqual([])
  })

  it('rejects a name that is not a public export', () => {
    expect(check('<Example of="Buton" />')).toEqual([
      `<Example of="Buton" />: Buton isn't a public export`,
    ])
  })

  it('rejects an export with no docs stories', () => {
    expect(check('<Example of="Card" />')).toEqual([
      '<Example of="Card" />: Card has no docs stories',
    ])
    expect(check('<Example of="forms/getting-started/arrays" />')).toEqual([
      '<Example of="forms/getting-started/arrays" />: forms/getting-started/arrays has no docs stories',
    ])
  })

  it('rejects a docs story the file does not have', () => {
    expect(check('<Example of="Button" name="Sizes" />')).toEqual([
      '<Example of="Button" name="Sizes" />: Button has no docs story Sizes',
    ])
  })

  it('rejects a tag without `of`', () => {
    expect(check('<Example name="Hierarchy" />')).toEqual(['<Example name="Hierarchy" />: no `of`'])
  })
})
