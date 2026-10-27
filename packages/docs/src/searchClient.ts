import type { SearchClient } from 'fumadocs-core/search/client'
import { staticClient } from 'fumadocs-core/search/client/orama-static'
import { DEFAULT_SEARCH_PROVIDER, SEARCH_ROUTE, type SearchProvider } from './config.ts'
import { PAGEFIND_PAGES, PAGEFIND_SCRIPT, toSearchResults, type PagefindApi } from './pagefind.ts'

let pagefind: Promise<PagefindApi> | undefined

/**
 * Pagefind's script, imported from the export on the first search. It isn't part of the site's
 * bundle: `kiln-docs postbuild` writes it beside the index, so the bundler must leave the import
 * alone. A failed load is forgotten, so the next search tries again.
 */
function loadPagefind(): Promise<PagefindApi> {
  pagefind ??= (
    import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ /* @vite-ignore */ PAGEFIND_SCRIPT
    ) as Promise<PagefindApi>
  ).catch((error: unknown) => {
    pagefind = undefined
    throw error
  })
  return pagefind
}

/** Searches the Pagefind index, loading the first `PAGEFIND_PAGES` pages' data. */
function pagefindClient(): SearchClient {
  return {
    search: async (query) => {
      const { results } = await (await loadPagefind()).search(query)
      const pages = await Promise.all(
        results.slice(0, PAGEFIND_PAGES).map((result) => result.data()),
      )
      return toSearchResults(pages)
    },
  }
}

/**
 * The browser half of the search seam: the client the header's search queries, reading what the
 * site's search route serves for the same provider (`search.ts`). Pagefind indexes the built
 * pages, so under `next dev`, where there's no build, it searches the search route's Orama index.
 */
export function searchClient(provider: SearchProvider = DEFAULT_SEARCH_PROVIDER): SearchClient {
  switch (provider) {
    case 'pagefind':
      return process.env.NODE_ENV === 'development'
        ? staticClient({ from: SEARCH_ROUTE })
        : pagefindClient()
    case 'orama-static':
      return staticClient({ from: SEARCH_ROUTE })
    default:
      throw new Error(`kiln-docs: search.provider ${String(provider)} isn't a search provider.`)
  }
}
