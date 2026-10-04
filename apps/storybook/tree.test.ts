/**
 * Keeps the Storybook tree on the ADR 0010 structure, which the docs site shares:
 * every title sits under a known group, ui and forms titles follow their source
 * folders, and every component's stories include a `Playground`.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

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

function files(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : files(path, pattern)
    return pattern.test(entry.name) ? [path] : []
  })
}

const STORY_FILES = [
  ...files(join(ROOT, 'packages/ui/src'), /\.stories\.tsx?$/),
  ...files(join(ROOT, 'packages/forms/src'), /\.stories\.tsx?$/),
]
const MDX_FILES = files(join(import.meta.dirname, 'docs'), /\.mdx$/)

const rel = (file: string) => relative(ROOT, file).split(sep).join('/')

function titleOf(file: string): string | undefined {
  const source = readFileSync(file, 'utf8')
  const meta = file.endsWith('.mdx')
    ? /<Meta\s+title="([^"]+)"/.exec(source)
    : /const meta = \{\s*title: '([^']+)'/.exec(source)
  return meta?.[1]
}

const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

describe('the Storybook tree', () => {
  const titled = [...STORY_FILES, ...MDX_FILES].map((file) => ({
    file: rel(file),
    title: titleOf(file),
  }))

  it('finds the stories', () => {
    expect(STORY_FILES.length).toBeGreaterThan(100)
  })

  it('gives every stories file and page a literal title', () => {
    expect(titled.filter((t) => t.title === undefined).map((t) => t.file)).toEqual([])
  })

  it('puts every title under a node of the ADR 0010 tree', () => {
    const outside = titled.filter(({ title = '' }) => {
      if (STANDALONE.includes(title)) return false
      const [top = '', group = ''] = title.split('/')
      return !TREE[top]?.includes(group)
    })
    expect(outside.map((t) => `${t.file}: ${String(t.title)}`)).toEqual([])
  })

  it('titles ui components by their source folder (UI/<Group>/<Name>)', () => {
    const wrong = titled.flatMap(({ file, title }) => {
      const match = /^packages\/ui\/src\/components\/([^/]+)\/([^/]+)\/\2\.stories\.tsx$/.exec(file)
      if (!match) return []
      const expected = `UI/${capitalise(match[1] ?? '')}/${match[2] ?? ''}`
      return title === expected ? [] : [`${file}: ${String(title)}, expected ${expected}`]
    })
    expect(wrong).toEqual([])
  })

  it('titles forms fields by their kit name (Forms/Fields/<Name>Field)', () => {
    const wrong = titled.flatMap(({ file, title }) => {
      const match = /^packages\/forms\/src\/fields\/Form([^/]+)\/Form\1\.stories\.tsx$/.exec(file)
      if (!match) return []
      const expected = `Forms/Fields/${match[1] ?? ''}`
      return title === expected ? [] : [`${file}: ${String(title)}, expected ${expected}`]
    })
    expect(wrong).toEqual([])
  })

  it('gives every component a Playground story', () => {
    const component =
      /^packages\/(ui\/src\/components\/[^/]+|forms\/src\/(fields|layouts|components))\/([^/]+)\/\3\.stories\.tsx$/
    const missing = STORY_FILES.map(rel).filter(
      (file) =>
        component.test(file) &&
        !/^export const Playground\b/m.test(readFileSync(join(ROOT, file), 'utf8')),
    )
    expect(missing).toEqual([])
  })
})
