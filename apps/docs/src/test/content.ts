import { execFileSync } from 'node:child_process'
import { globSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { parse } from 'yaml'

export const appDir = resolve(import.meta.dirname, '../..')
export const repoDir = resolve(appDir, '../..')
export const contentDir = join(appDir, 'content/docs')

export interface ContentPage {
  /** Path under content/docs without the extension: `ui/actions/button`. */
  path: string
  frontmatter: { title: string; description?: string; exports?: string[] }
  body: string
}

export function contentPages(): ContentPage[] {
  return globSync('**/*.mdx', { cwd: contentDir })
    .sort()
    .map((file) => {
      const raw = readFileSync(join(contentDir, file), 'utf8')
      const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)
      if (!match) throw new Error(`content/docs/${file} has no frontmatter`)
      return {
        path: file
          .replace(/\.mdx$/, '')
          .split(sep)
          .join('/'),
        frontmatter: parse(match[1] ?? '') as ContentPage['frontmatter'],
        body: match[2] ?? '',
      }
    })
}

/** `UI/Inputs/OneTimeCodeField` → `ui/inputs/one-time-code-field`; `Getting started` → `getting-started`. */
export function titleToPath(title: string): string {
  return title
    .split('/')
    .map((segment) =>
      segment
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase(),
    )
    .join('/')
}

/** A story entry of the index `storybook index` writes. */
interface StoryIndexEntry {
  type: 'story' | 'docs'
  title: string
  importPath: string
  exportName?: string
}

/**
 * Every package stories file's `title` and story export names, from the index Storybook
 * itself builds (`storybook index`, run in apps/storybook), so it sees what the sidebar shows.
 */
export function storyTitles(): { title: string; file: string; stories: string[] }[] {
  const storybookDir = join(repoDir, 'apps/storybook')
  const require = createRequire(join(storybookDir, 'package.json'))
  const manifest = require.resolve('storybook/package.json')
  const { bin } = require(manifest) as { bin: string }
  const dir = mkdtempSync(join(tmpdir(), 'kiln-docs-storybook-index-'))
  let entries: StoryIndexEntry[]
  try {
    const file = join(dir, 'index.json')
    execFileSync(
      process.execPath,
      [join(dirname(manifest), bin), 'index', '--quiet', '--output-file', file],
      {
        cwd: storybookDir,
        env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1' },
        stdio: 'pipe',
      },
    )
    entries = Object.values(
      (JSON.parse(readFileSync(file, 'utf8')) as { entries: Record<string, StoryIndexEntry> })
        .entries,
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }

  const byFile = new Map<string, { title: string; file: string; stories: string[] }>()
  for (const entry of entries) {
    if (entry.type !== 'story' || !entry.exportName) continue
    const file = relative(repoDir, resolve(storybookDir, entry.importPath)).split(sep).join('/')
    if (!file.startsWith('packages/')) continue
    const story = byFile.get(file) ?? { title: entry.title, file, stories: [] }
    story.stories.push(entry.exportName)
    byFile.set(file, story)
  }
  const titles = [...byFile.values()]
  if (titles.length < 150) {
    throw new Error(
      `storybook index found ${String(titles.length)} stories files, expected at least 150`,
    )
  }
  return titles
}
