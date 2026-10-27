/**
 * Pagefind, the default search provider (ADR 0048): `kiln-docs postbuild` indexes the exported
 * docs pages into `out/pagefind/`, and the header's search loads Pagefind's own script from
 * there, which fetches only the index chunks a query touches. This module holds what both halves
 * share. It imports nothing, so the bin loads it in plain Node.
 */

/** The folder in the static export that the index is written to, and the browser loads it from. */
export const PAGEFIND_DIR = 'pagefind'

/** Pagefind's script in the export, which the header imports on the first search. */
export const PAGEFIND_SCRIPT = `/${PAGEFIND_DIR}/pagefind.js`

/**
 * The part of a page Pagefind indexes: the article, which holds the page's title, its breadcrumb
 * and its content. The header, sidebar and footer are the same on every page.
 */
export const PAGEFIND_ROOT = 'article'

/** The pages Pagefind indexes: the docs, at `/docs` and under it. */
export const PAGEFIND_GLOB = '{docs.html,docs/**/*.html}'

/** One section of a result: the page's text under one of its headings. */
export interface PagefindSubResult {
  title: string
  url: string
  /** Text with `<mark>` around the matches. */
  excerpt: string
}

/** A result's data, as Pagefind's `result.data()` resolves it. */
export interface PagefindPage {
  url: string
  excerpt: string
  meta: { title?: string; crumbs?: string }
  sub_results: PagefindSubResult[]
}

/** The part of Pagefind's browser API (`pagefind.js`) the header uses. */
export interface PagefindApi {
  search: (
    query: string,
  ) => Promise<{ results: { id: string; data: () => Promise<PagefindPage> }[] }>
}

/** A result in the shape the header renders: fumadocs-core's `SortedResult`. */
export interface SearchResult {
  id: string
  url: string
  type: 'page' | 'heading' | 'text'
  content: string
  breadcrumbs?: string[]
}

/** How many pages a search loads, each one fragment request. */
export const PAGEFIND_PAGES = 10

/** How many sections the header shows under each page. */
const SECTIONS = 3

/**
 * A result's URL as a reader opens it: Pagefind names the export's file (`/docs/ui.html`), and the
 * site serves it without the extension (`/docs/ui`).
 */
export function pageUrl(url: string): string {
  const [path = '', hash] = url.split('#')
  const page = path.replace(/\.html$/, '')
  return hash === undefined ? page : `${page}#${hash}`
}

/**
 * Pagefind's excerpts escape the page's text as HTML around their `<mark>`s. The header renders
 * text, so it reads the entities back.
 */
function unescape(excerpt: string): string {
  return excerpt
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&')
}

/**
 * Pagefind's pages as the header's results: each page, with its breadcrumb, then the sections that
 * matched, each linking to its heading. The same shape as the Orama index's results.
 */
export function toSearchResults(pages: readonly PagefindPage[]): SearchResult[] {
  return pages.flatMap((page) => {
    const url = pageUrl(page.url)
    const crumbs = page.meta.crumbs?.split(' / ').filter(Boolean)
    const sections = (page.sub_results.length ? page.sub_results : [{ ...page, title: '' }])
      .slice(0, SECTIONS)
      .map((section): SearchResult => ({
        id: `${url}:${pageUrl(section.url)}`,
        url: pageUrl(section.url),
        type: 'text',
        content: unescape(section.excerpt),
      }))
    return [
      {
        id: url,
        url,
        type: 'page',
        content: page.meta.title ?? url,
        ...(crumbs?.length ? { breadcrumbs: crumbs } : {}),
      },
      ...sections,
    ]
  })
}
