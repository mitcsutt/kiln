interface OrderedPage {
  /** The page's file path inside its collection: `ui/actions/button.mdx`. */
  path: string
}

/** By file path, compared by UTF-16 code unit, so the order doesn't depend on the locale. */
export function comparePages(a: OrderedPage, b: OrderedPage): number {
  if (a.path < b.path) return -1
  return a.path > b.path ? 1 : 0
}

/**
 * Makes the loader's `getPages()` return pages in a defined order, by file path. `llms.txt`,
 * `llms-full.txt` and the search index read pages through it, so their order doesn't rest on the
 * order Fumadocs stored the files in, which changes once pages come from more than one
 * collection (ADR 0045).
 */
export function withPageOrder<Source extends { getPages: (language?: string) => OrderedPage[] }>(
  source: Source,
): Source {
  const unordered = source.getPages.bind(source)
  // Replaced in place: the loader's own methods (`generateParams`) call `this.getPages`, and a
  // copy would evaluate its `pageTree` getter.
  source.getPages = (language) => [...unordered(language)].sort(comparePages)
  return source
}
