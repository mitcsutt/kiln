/**
 * Keeps the Storybook tree on the ADR 0010 structure, which the docs site shares:
 * every title sits under a known group, ui and forms titles follow their source
 * folders, every docs examples file follows its naming rule, and every component's stories
 * include a `Playground`. The naming rules, shared with the indexer (`examplesRule` in
 * `.storybook/examples.ts`): an examples file whose owner has stories is
 * `<owner stories title>/Examples`; otherwise a guide under `src/docs/` is named by path, on
 * an ADR 0010 group and without `/Examples`; otherwise it is `<owner>/Examples`, with the
 * owner on an ADR 0010 group. It reads the index Storybook itself builds from
 * `.storybook/main.ts` (`storybook index`), so it sees the titles and stories the sidebar
 * shows.
 */
import { execFileSync } from 'node:child_process'
import { globSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'

import type { StoryIndex } from 'storybook/internal/types'

import { examplesRule, examplesTitle } from './.storybook/examples.ts'

const ROOT = join(import.meta.dirname, '../..')

/** The ADR 0010 tree: top-level nodes and the groups under each, shared with the docs site. */
const TREE = JSON.parse(readFileSync(join(ROOT, 'docs/tree.json'), 'utf8')) as Record<
  string,
  readonly string[]
>

/** Pages that sit outside the tree. */
const STANDALONE = ['Introduction']

function storybookIndex(): StoryIndex {
  const require = createRequire(import.meta.url)
  const manifest = require.resolve('storybook/package.json')
  const { bin } = require(manifest) as { bin: string }
  const cli = join(dirname(manifest), bin)
  const dir = mkdtempSync(join(tmpdir(), 'kiln-storybook-index-'))
  try {
    const file = join(dir, 'index.json')
    execFileSync(process.execPath, [cli, 'index', '--quiet', '--output-file', file], {
      cwd: import.meta.dirname,
      env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1' },
      stdio: 'pipe',
    })
    return JSON.parse(readFileSync(file, 'utf8')) as StoryIndex
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** Every index entry, with its file relative to the repo root. */
const ENTRIES = Object.values(storybookIndex().entries).map((entry) => ({
  ...entry,
  file: relative(ROOT, resolve(import.meta.dirname, entry.importPath))
    .split(sep)
    .join('/'),
}))

/** One title per file: a stories file's stories and its docs page share it. */
const TITLES = [...new Map(ENTRIES.map(({ file, title }) => [file, title])).entries()].map(
  ([file, title]) => ({ file, title }),
)

const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

/** Whether a title sits on a group of the ADR 0010 tree. */
function onGroup(title: string): boolean {
  const [top = '', group = ''] = title.split('/')
  return TREE[top]?.includes(group) ?? false
}

/** Every indexed stories file's title, by file. */
const STORIES = new Map(
  TITLES.filter(({ file }) => file.endsWith('.stories.tsx')).map(({ file, title }) => [
    file,
    title,
  ]),
)

/**
 * Why an examples file's title breaks the naming rules, if it does. The rule comes from
 * `examplesRule`, the one the indexer uses: with owner stories, `<owner stories title>/Examples`;
 * otherwise a guide under `src/docs/` is named by path, on an ADR 0010 group, without
 * `/Examples` and without taking a stories title; otherwise `<owner>/Examples` with the owner
 * on an ADR 0010 group.
 */
function examplesTitleProblem(file: string, title: string): string | undefined {
  const rule = examplesRule(join(ROOT, file))
  if (rule.kind === 'owner') {
    const stories = STORIES.get(relative(ROOT, rule.stories).split(sep).join('/'))
    return title === `${stories ?? ''}/Examples` ? undefined : `expected ${stories ?? '?'}/Examples`
  }
  if (rule.kind === 'guide') {
    if (title.endsWith('/Examples')) return 'a guide is named by path, without /Examples'
    if ([...STORIES.values()].includes(title)) return 'a guide takes the title of a stories file'
    return onGroup(title) ? undefined : 'not on an ADR 0010 group'
  }
  if (!title.endsWith('/Examples')) return 'expected <owner>/Examples'
  return onGroup(title.slice(0, -'/Examples'.length)) ? undefined : 'not on an ADR 0010 group'
}

describe('the Storybook tree', () => {
  it('indexes the stories and the workbench pages', () => {
    expect(TITLES.filter(({ file }) => file.startsWith('packages/')).length).toBeGreaterThan(100)
    expect(
      TITLES.filter(({ file }) => file.startsWith('apps/storybook/docs/'))
        .map(({ title }) => title)
        .sort(),
    ).toEqual([
      'Introduction',
      'Tooling/ESLint config',
      'Tooling/Prettier config',
      'Tooling/TSConfig',
    ])
  })

  it('puts every title under a node of the ADR 0010 tree', () => {
    const outside = TITLES.filter(({ title }) => {
      if (STANDALONE.includes(title)) return false
      const [top = '', group = ''] = title.split('/')
      return !TREE[top]?.includes(group)
    })
    expect(outside.map((t) => `${t.file}: ${t.title}`)).toEqual([])
  })

  it('titles ui components by their source folder (UI/<Group>/<Name>)', () => {
    const wrong = TITLES.flatMap(({ file, title }) => {
      const match = /^packages\/ui\/src\/components\/([^/]+)\/([^/]+)\/\2\.stories\.tsx$/.exec(file)
      if (!match) return []
      const expected = `UI/${capitalise(match[1] ?? '')}/${match[2] ?? ''}`
      return title === expected ? [] : [`${file}: ${title}, expected ${expected}`]
    })
    expect(wrong).toEqual([])
  })

  it('titles forms fields by their kit name (Forms/Fields/<Name>Field)', () => {
    const wrong = TITLES.flatMap(({ file, title }) => {
      const match = /^packages\/forms\/src\/fields\/Form([^/]+)\/Form\1\.stories\.tsx$/.exec(file)
      if (!match) return []
      const expected = `Forms/Fields/${match[1] ?? ''}`
      return title === expected ? [] : [`${file}: ${title}, expected ${expected}`]
    })
    expect(wrong).toEqual([])
  })

  it('names every docs examples file by path (guides) or by owner (<owner>/Examples)', () => {
    const files = globSync('packages/*/src/**/*.examples.tsx', { cwd: ROOT }).sort()
    const titleOf = new Map(TITLES.map(({ file, title }) => [file, title]))
    const wrong = files.flatMap((file) => {
      const title = titleOf.get(file)
      if (!title) return [`${file}: not indexed`]
      const problem = examplesTitleProblem(file, title)
      return problem ? [`${file}: ${title}, ${problem}`] : []
    })
    expect(files.length).toBeGreaterThan(0)
    expect(wrong).toEqual([])
  })

  it('gives every component a Playground story', () => {
    const component =
      /^packages\/(ui\/src\/components\/[^/]+|forms\/src\/(fields|layouts|components))\/([^/]+)\/\3\.stories\.tsx$/
    const withPlayground = new Set(
      ENTRIES.filter(({ type, name }) => type === 'story' && name === 'Playground').map(
        ({ file }) => file,
      ),
    )
    const missing = TITLES.map(({ file }) => file).filter(
      (file) => component.test(file) && !withPlayground.has(file),
    )
    expect(missing).toEqual([])
  })
})

describe('the title of an examples file', () => {
  /** The title the indexer gives `file`, and why it breaks the naming rules, if it does. */
  function titled(file: string): { title: string; problem: string | undefined } {
    const title = examplesTitle(join(ROOT, file))
    return { title, problem: examplesTitleProblem(file, title) }
  }

  it("takes the owner's stories title for a guide topic beside its stories", () => {
    expect(titled('packages/ui/src/docs/patterns/Settings.examples.tsx')).toEqual({
      title: 'UI/Patterns/Settings/Examples',
      problem: undefined,
    })
  })

  it('names a guide topic without stories by its path (<Package>/<Guide>/<Topic>)', () => {
    expect(titled('packages/forms/src/docs/getting-started/first-form.examples.tsx')).toEqual({
      title: 'Forms/Getting started/First form',
      problem: undefined,
    })
  })

  it('names a guide topic by its path at any depth under src/docs/', () => {
    expect(
      titled('packages/forms/src/docs/getting-started/layouts/side-by-side.examples.tsx'),
    ).toEqual({ title: 'Forms/Getting started/Layouts/Side by side', problem: undefined })
  })

  // Owner stories match with exact case, so a lowercase name gets the same title on a
  // case-insensitive file system as on Linux CI, and the tree test reports the clash.
  it('matches owner stories with exact case, and reports a guide that takes a stories title', () => {
    expect(titled('packages/ui/src/docs/patterns/settings.examples.tsx')).toEqual({
      title: 'UI/Patterns/Settings',
      problem: 'a guide takes the title of a stories file',
    })
  })

  it("names a storyless owner like its sibling components' stories, plus Examples", () => {
    expect(
      titled('packages/forms/src/components/fields/FormNewField/FormNewField.examples.tsx'),
    ).toEqual({ title: 'Forms/Fields/NewField/Examples', problem: undefined })
    expect(titled('packages/ui/src/components/actions/NewAction/NewAction.examples.tsx')).toEqual({
      title: 'UI/Actions/NewAction/Examples',
      problem: undefined,
    })
  })

  it('names a storyless hook in a flat folder like its sibling hooks, plus Examples', () => {
    expect(titled('packages/forms/src/hooks/useScopeErrors.examples.tsx')).toEqual({
      title: 'Forms/Hooks/useScopeErrors/Examples',
      problem: undefined,
    })
  })
})
