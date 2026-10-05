/**
 * Docs examples (`<Owner>.examples.tsx`) are CSF without a default export: each named
 * export is one example, and the file carries no Storybook meta so it reads as plain
 * code on the docs site. The workbench loads them as stories all the same, so every
 * example renders, passes axe and runs in every theme and mode under `pnpm test:storybook`.
 *
 * One rule (`examplesRule`) decides the title, and `tree.test.ts` checks titles with it:
 *
 * - **Owner stories exist** (`<Owner>.stories.tsx`, matched with exact case): the owner's
 *   stories title plus `/Examples`. `Button.examples.tsx` is `UI/Actions/Button/Examples`.
 * - **Otherwise, a guide under `src/docs/`**, at any depth: named by path, on its ADR 0010
 *   group and without `/Examples`. `docs/getting-started/first-form.examples.tsx` is
 *   `Forms/Getting started/First form`.
 * - **Otherwise, a storyless owner**: the group and naming of its sibling components'
 *   stories, plus `/Examples`.
 *
 * The indexer and the Vite plugin below give Storybook and the Vitest addon the same
 * default export, so the sidebar, the dev server and the tests agree.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, dirname, join, sep } from 'node:path'

import { loadCsf } from 'storybook/internal/csf-tools'
import type { Indexer } from 'storybook/internal/types'
import type { Plugin } from 'vite'

export const EXAMPLES_FILE = /\.examples\.tsx$/

const SKIP = new Set(['node_modules', 'dist'])

/** Every file under `dir`, skipping dependencies and build output. */
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return SKIP.has(entry.name) ? [] : walk(path)
    return [path]
  })
}

/** The package an examples file belongs to: the `packages/<name>/src` it sits in. */
function packageSource(file: string): string {
  const parts = file.split(sep)
  const at = parts.lastIndexOf('src')
  if (at < 0) throw new Error(`${file}: an examples file must sit under a package's src/`)
  return parts.slice(0, at + 1).join(sep)
}

const storiesCache = new Map<string, Map<string, string[]>>()

/**
 * Every `<Name>.stories.tsx` in a package source, by `<Name>`, read once per package. The
 * dev server drops the cache when a file is added or removed (`examplesPlugin`).
 */
function storiesFiles(source: string): Map<string, string[]> {
  let stories = storiesCache.get(source)
  if (!stories) {
    stories = new Map()
    for (const path of walk(source)) {
      if (!path.endsWith('.stories.tsx')) continue
      const name = basename(path, '.stories.tsx')
      stories.set(name, [...(stories.get(name) ?? []), path])
    }
    storiesCache.set(source, stories)
  }
  return stories
}

/** The `title` in a stories file's meta. Stories titles are string literals (ADR 0010). */
function storiesTitle(file: string): string | undefined {
  return /^\s*title:\s*'([^']+)'/m.exec(readFileSync(file, 'utf8'))?.[1]
}

const PACKAGES: Record<string, string> = { ui: 'UI', forms: 'Forms' }

/** A path segment as a title segment: `getting-started` reads `Getting started`. */
function label(segment: string): string {
  const words = segment.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * The title an owner's stories would have, from the stories of its sibling components:
 * their group, and their naming (`FormAmountField` is `Forms/Fields/AmountField`, so
 * `FormHiddenField` is `Forms/Fields/HiddenField`). Siblings are the other component
 * folders beside the owner's folder or, in a flat folder, the other modules beside the
 * file, wherever in the package their stories sit (`useAutosave` is `Forms/Hooks/useAutosave`).
 */
function siblingTitle(file: string, owner: string): string | undefined {
  const dir = dirname(file)
  const siblings =
    basename(dir) === owner
      ? readdirSync(dirname(dir))
      : existsSync(dir)
        ? readdirSync(dir).map((name) => name.split('.')[0] ?? name)
        : []
  const stories = storiesFiles(packageSource(file))
  for (const component of siblings) {
    const path = stories.get(component)?.[0]
    const title = path && component !== owner ? storiesTitle(path) : undefined
    if (!title) continue
    const at = title.lastIndexOf('/')
    const name = title.slice(at + 1)
    if (!component.endsWith(name)) continue
    const prefix = component.slice(0, component.length - name.length)
    const ownerName = owner.startsWith(prefix) ? owner.slice(prefix.length) : owner
    return `${title.slice(0, at)}/${ownerName}/Examples`
  }
  return undefined
}

/** Which naming rule an examples file follows. */
export type ExamplesRule =
  { kind: 'owner'; stories: string } | { kind: 'guide' } | { kind: 'storyless' }

/**
 * The naming rule for an examples file. Its owner's stories are `<Owner>.stories.tsx`
 * beside it or, failing that, the one file of that name elsewhere in the package (forms
 * hooks keep theirs in `src/stories/hooks`). Names are compared with exact case, so the
 * rule is the same on a case-insensitive file system and on Linux CI.
 */
export function examplesRule(file: string): ExamplesRule {
  const owner = basename(file).replace(EXAMPLES_FILE, '')
  const name = `${owner}.stories.tsx`
  const source = packageSource(file)
  const candidates = storiesFiles(source).get(owner) ?? []
  const beside = join(dirname(file), name)
  const stories = candidates.includes(beside) ? [beside] : candidates
  if (stories.length > 1) {
    throw new Error(
      `${file}: found ${String(stories.length)} ${name} files in the package. ` +
        `An examples file takes its title from its owner's stories, so there must be at most one.`,
    )
  }
  const [path] = stories
  if (path) return { kind: 'owner', stories: path }
  return file.startsWith(join(source, 'docs') + sep) ? { kind: 'guide' } : { kind: 'storyless' }
}

/** The package's top-level tree node: `UI` for `packages/ui`, `Forms` for `packages/forms`. */
function packageNode(source: string): string {
  const name = basename(dirname(source))
  return PACKAGES[name] ?? label(name)
}

/**
 * The Storybook title for an examples file, by its naming rule (`examplesRule`). A guide's
 * folders under `src/docs/` and its topic become the path (`Forms/Getting started/First
 * form`). A storyless owner whose siblings have no stories gets `<Package>/<Owner>/Examples`,
 * which the tree test reports.
 */
export function examplesTitle(file: string): string {
  const rule = examplesRule(file)
  const owner = basename(file).replace(EXAMPLES_FILE, '')
  const source = packageSource(file)
  if (rule.kind === 'owner') {
    const title = storiesTitle(rule.stories)
    if (!title) throw new Error(`${rule.stories}: no string \`title\` in the meta`)
    return `${title}/Examples`
  }
  if (rule.kind === 'guide') {
    const folders = dirname(file).slice(join(source, 'docs').length).split(sep).filter(Boolean)
    return [packageNode(source), ...[...folders, owner].map(label)].join('/')
  }
  return siblingTitle(file, owner) ?? `${packageNode(source)}/${owner}/Examples`
}

/** The examples file as CSF: its code plus the default export Storybook needs. */
export function withExamplesMeta(code: string, file: string): string {
  return `${code}\nexport default { title: ${JSON.stringify(examplesTitle(file))} }\n`
}

/** Indexes `*.examples.tsx` like a stories file, with the default export added. */
export const examplesIndexer: Indexer = {
  test: EXAMPLES_FILE,
  createIndex: async (fileName, options) => {
    const code = withExamplesMeta(await readFile(fileName, 'utf8'), fileName)
    return loadCsf(code, { ...options, fileName }).parse().indexInputs
  },
}

/**
 * Gives every examples module the same default export at load time, before Storybook's
 * own plugins (and the Vitest addon's story transform) read it as CSF.
 */
export function examplesPlugin(): Plugin {
  return {
    name: 'kiln:examples-meta',
    enforce: 'pre',
    configureServer(server) {
      const forget = () => {
        storiesCache.clear()
      }
      server.watcher.on('add', forget)
      server.watcher.on('unlink', forget)
    },
    transform(code, id) {
      const file = id.split('?')[0] ?? id
      if (!file.endsWith('.examples.tsx')) return null
      return { code: withExamplesMeta(code, file), map: null }
    },
  }
}
