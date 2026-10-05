/**
 * Docs examples (`<Owner>.examples.tsx`) are CSF without a default export: each named
 * export is one example, and the file carries no Storybook meta so it reads as plain
 * code on the docs site. The workbench loads them as stories all the same, so every
 * example renders, passes axe and runs in every theme and mode under `pnpm test:storybook`.
 *
 * The title comes from the owner's stories: `Button.examples.tsx` takes the title of
 * `Button.stories.tsx` in the same package, plus `/Examples` (`UI/Actions/Button/Examples`).
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

/** The `title` in a stories file's meta. Stories titles are string literals (ADR 0010). */
function storiesTitle(file: string): string | undefined {
  return /^\s*title:\s*'([^']+)'/m.exec(readFileSync(file, 'utf8'))?.[1]
}

/**
 * The Storybook title for an examples file: its owner's stories title plus `/Examples`.
 * The owner's stories are `<Owner>.stories.tsx` beside it or, failing that, the one file
 * of that name elsewhere in the package (forms hooks keep theirs in `src/stories/hooks`).
 */
export function examplesTitle(file: string): string {
  const owner = basename(file).replace(EXAMPLES_FILE, '')
  const name = `${owner}.stories.tsx`
  const beside = join(dirname(file), name)
  const stories = existsSync(beside)
    ? [beside]
    : walk(packageSource(file)).filter((path) => basename(path) === name)
  if (stories.length !== 1) {
    throw new Error(
      `${file}: found ${String(stories.length)} ${name} files in the package. ` +
        `An examples file takes its title from its owner's stories, so there must be exactly one.`,
    )
  }
  const [path = ''] = stories
  const title = storiesTitle(path)
  if (!title) throw new Error(`${path}: no string \`title\` in the meta`)
  return `${title}/Examples`
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
    transform(code, id) {
      const file = id.split('?')[0] ?? id
      if (!file.endsWith('.examples.tsx')) return null
      return { code: withExamplesMeta(code, file), map: null }
    },
  }
}
