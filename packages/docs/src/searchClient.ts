import { staticClient } from 'fumadocs-core/search/client/orama-static'
import { DEFAULT_SEARCH_PROVIDER, SEARCH_ROUTE, type SearchProvider } from './config.ts'

/**
 * The browser half of the search seam: the client the header's search queries, reading what the
 * site's search route serves for the same provider (`search.ts`).
 */
export function searchClient(provider: SearchProvider = DEFAULT_SEARCH_PROVIDER) {
  if ((provider as string) !== 'orama-static') {
    throw new Error(`kiln-docs: search.provider ${provider} isn't a search provider.`)
  }
  return staticClient({ from: SEARCH_ROUTE })
}
