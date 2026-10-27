/**
 * A docs site's config: what makes the site its own. The chrome, the theme glue and the Markdown
 * routes read it instead of holding a site's facts. A site's is `site.config.ts` at its root.
 *
 * It holds data only: client components read it, so a function here would pull its imports into
 * the browser. It's also Node-loadable (ADR 0045): the `kiln-docs` bin loads it through esbuild,
 * so it uses no tsconfig path aliases and imports nothing plain Node can't load.
 */
export interface SiteLink {
  href: string
  label: string
}

/**
 * A search backend: the route that serves its index and the client that queries it. Only the
 * static Orama index for now; Pagefind is measured before the first release, and the provider is
 * chosen then, because switching later would change every site's search route (ADR 0045).
 */
export type SearchProvider = 'orama-static'

export const DEFAULT_SEARCH_PROVIDER: SearchProvider = 'orama-static'

/** Where the search route is: `app/api/search/route.ts`. */
export const SEARCH_ROUTE = '/api/search'

export interface SiteConfig {
  /** The wordmark, the title template, the sidebar's overview label and the `llms.txt` heading. */
  name: string
  /** The description in every page's metadata that doesn't set its own. */
  description: string
  /** Where the site is deployed, with no trailing slash. The Markdown's absolute links use it. */
  url: string
  repository: { url: string }
  /**
   * A theme picker in the header, over `picker`, starting on `default`. The site imports the
   * stylesheet of each theme it lists.
   */
  theme: { picker: readonly string[]; default: string }
  nav: {
    /** The sections in the header, each a top-level folder of the docs. */
    sections: readonly SiteLink[]
    /**
     * The sidebar's names for its lists outside a section: `pages` for the top-level pages (the
     * site's name by default) and `sections` for the list of sections (`'Sections'` by default).
     * Kiln's are "Kiln" and "Packages".
     */
    labels?: { pages?: string; sections?: string }
  }
  footer: { text: string; links: readonly SiteLink[] }
  search: {
    placeholder: string
    /** Where search runs. `'orama-static'`, the default, exports one index at build time. */
    provider?: SearchProvider
  }
  /** The 404 page's copy, and where it sends a reader. */
  notFound: { description: string; action: SiteLink }
  markdown: {
    llms: {
      /** The `>` paragraph under the `llms.txt` heading. */
      intro: string
      /** Each top-level folder's heading in `llms.txt`, and `''` for the pages outside them. */
      sections: Readonly<Record<string, string>>
    }
  }
  /**
   * The axes `<Variant>` blocks choose between (ADR 0038): each prop name with its label and its
   * values' labels. The first value is the default.
   */
  variants: Readonly<Record<string, { label: string; values: Readonly<Record<string, string>> }>>
}

/** Checks a site's config against `SiteConfig`, keeping its literal types. */
export function defineSite<const Config extends SiteConfig>(config: Config): Config {
  return config
}

/** Where a site's hand-written pages live, from its root. */
export const DEFAULT_CONTENT_DIR = 'content/docs'

/**
 * Where `writeGenerated()` writes a site's generated pages, from its root. It's a folder of its
 * own, because `.generated/` may hold a site's other build data, which emptying it would delete.
 */
export const DEFAULT_GENERATED_DIR = '.generated/pages'
