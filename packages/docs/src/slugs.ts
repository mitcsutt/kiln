import type { MetaData, PageData, StaticSource, VirtualFile } from 'fumadocs-core/source'

/** The page and `meta` data of a source, as Fumadocs types it. */
export interface SourceConfig {
  pageData: PageData
  metaData: MetaData
}

/**
 * Precedence by slug (ADR 0045). A page's slug is its path inside its folder minus the extension,
 * so `plugins/git/index.md` and `plugins/git/index.mdx` are one page. A hand-written page beats a
 * generated page with the same slug, whatever the extension of either; two files of one page in
 * one collection fail. Left to Fumadocs, the order its sources were read in would pick the
 * winner, and a clash would either move a page to `/x/index` without an error or throw
 * `Duplicated slugs`.
 */

/** A page's slug: its path minus the extension. */
export const slugOf = (path: string) => path.replace(/\.[^./]+$/, '')

/** Why a generated page or `meta` file isn't published. */
export const shadowedMessage = (generated: string, handWritten: string) =>
  `kiln-docs: skipped the generated ${generated}: the hand-written ${handWritten} takes its place.`

/** Indexes pages by slug, and fails on two files of one page. */
export function indexPages(paths: Iterable<string>, folder: string): Map<string, string> {
  const pages = new Map<string, string>()
  for (const path of paths) {
    const slug = slugOf(path)
    const other = pages.get(slug)
    if (other !== undefined) {
      throw new Error(
        `kiln-docs: ${other} and ${path} in ${folder} are one page, ${slug}. Keep one of them.`,
      )
    }
    pages.set(slug, path)
  }
  return pages
}

const pagePaths = (files: readonly VirtualFile[]) =>
  files.filter((file) => file.type === 'page').map((file) => file.path)

/**
 * One source of the hand-written and generated files, with each generated file a hand-written
 * one shadows left out and reported. The two never share a path or a slug, so the loader's order
 * can't change which one is published.
 */
export function mergeSources<Config extends SourceConfig>(
  handWritten: StaticSource<Config>,
  generated?: StaticSource<Config>,
): StaticSource<Config> {
  const pages = indexPages(pagePaths(handWritten.files), 'the hand-written pages')
  if (!generated) return { files: handWritten.files }
  indexPages(pagePaths(generated.files), 'the generated pages')
  const metas = new Set(
    handWritten.files.filter((file) => file.type === 'meta').map((file) => file.path),
  )
  const kept = generated.files.filter((file) => {
    // A `meta` file has no slug: the hand-written one at the same path wins.
    const shadow =
      file.type === 'page'
        ? pages.get(slugOf(file.path))
        : metas.has(file.path)
          ? file.path
          : undefined
    if (shadow === undefined) return true
    console.warn(shadowedMessage(file.path, shadow))
    return false
  })
  return { files: [...handWritten.files, ...kept] }
}
