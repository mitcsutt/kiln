import { globSync, readFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
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

/** Every story file's `title`, read from the source of both packages. */
export function storyTitles(): { title: string; file: string }[] {
  const files = globSync('packages/*/src/**/*.stories.tsx', { cwd: repoDir })
  return files.flatMap((file) => {
    const source = readFileSync(join(repoDir, file), 'utf8')
    const title = /^const meta = \{[\s\S]*?^\s{2}title: '([^']+)'/m.exec(source)?.[1]
    return title ? [{ title, file }] : []
  })
}
