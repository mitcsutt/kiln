/**
 * Keeps the Storybook tree on the ADR 0010 structure, which the docs site shares:
 * every title sits under a known group, ui and forms titles follow their source
 * folders, and every component's stories include a `Playground`. It reads the index
 * Storybook itself builds from `.storybook/main.ts` (`storybook index`), so it sees
 * the titles and stories the sidebar shows.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'

import type { StoryIndex } from 'storybook/internal/types'

const ROOT = join(import.meta.dirname, '../..')

/** The ADR 0010 tree: top-level nodes and the groups under each. */
const TREE: Record<string, readonly string[]> = {
  UI: [
    'Foundations',
    'Actions',
    'Inputs',
    'Layout',
    'Display',
    'Navigation',
    'Feedback',
    'Overlays',
    'Typography',
    'Themes',
    'Patterns',
  ],
  Forms: ['Getting started', 'Fields', 'Layouts', 'Hooks', 'Schema'],
  Tooling: ['ESLint config', 'Prettier config', 'TSConfig'],
}

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
