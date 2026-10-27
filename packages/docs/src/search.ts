import { createFromSource } from 'fumadocs-core/search/server'
import type { LoaderConfig, LoaderOutput } from 'fumadocs-core/source'
import { DEFAULT_SEARCH_PROVIDER, type SearchProvider } from './config.ts'

/**
 * The seam between a site and its search backend (ADR 0045). A site names a provider in
 * `search.provider`; its search route serves what that provider's client reads. The static Orama
 * index is the only provider until Pagefind is measured, and the provider is chosen before the
 * first release, because switching afterwards would change every site's search route.
 */

/** The search route's handler, which a static export calls once at build time. */
export interface SearchRoute {
  GET: () => Promise<Response>
}

/** The search route for `provider`, over the site's pages. */
export function createSearchRoute<Config extends LoaderConfig>(
  source: LoaderOutput<Config>,
  provider: SearchProvider = DEFAULT_SEARCH_PROVIDER,
): SearchRoute {
  if ((provider as string) !== 'orama-static') {
    throw new Error(`kiln-docs: search.provider ${provider} isn't a search provider.`)
  }
  // The index is exported once at build time and searched in the browser, so the site needs no
  // server. Fumadocs builds it on the first request, not here.
  return { GET: createFromSource(source).staticGET }
}
