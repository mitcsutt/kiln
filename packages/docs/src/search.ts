import { createFromSource } from 'fumadocs-core/search/server'
import type { LoaderConfig, LoaderOutput } from 'fumadocs-core/source'
import { DEFAULT_SEARCH_PROVIDER, type SearchProvider } from './config.ts'

/**
 * The seam between a site and its search backend (ADR 0046, ADR 0049). A site names a provider in
 * `search.provider`; its search route serves what that provider's client reads under `next dev`
 * or in the build.
 *
 * - `pagefind`, the default: `kiln-docs postbuild` indexes the built pages, so a build's search
 *   route serves nothing, and postbuild deletes what it wrote. `next dev` has no build to index:
 *   there the route serves the Orama index, which the header searches instead.
 * - `orama-static`: the route exports the Orama index at build time, and the header downloads it
 *   whole on the first search.
 */

/** The search route's handler, which a static export calls once at build time. */
export interface SearchRoute {
  GET: () => Promise<Response>
}

/** What a build's search route serves under Pagefind, which `kiln-docs postbuild` deletes. */
const PAGEFIND_BUILD = 'kiln-docs: search runs on Pagefind, in /pagefind/.'

/** The search route for `provider`, over the site's pages. */
export function createSearchRoute<Config extends LoaderConfig>(
  source: LoaderOutput<Config>,
  provider: SearchProvider = DEFAULT_SEARCH_PROVIDER,
): SearchRoute {
  // The index is exported once at build time and searched in the browser, so the site needs no
  // server. Fumadocs builds it on the first request, not here.
  const { staticGET } = createFromSource(source)
  switch (provider) {
    case 'pagefind':
      return {
        GET: () =>
          process.env.NODE_ENV === 'development'
            ? staticGET()
            : Promise.resolve(new Response(PAGEFIND_BUILD, { status: 404 })),
      }
    case 'orama-static':
      return { GET: staticGET }
    default:
      throw new Error(`kiln-docs: search.provider ${String(provider)} isn't a search provider.`)
  }
}
