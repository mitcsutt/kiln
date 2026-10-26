/**
 * A docs site's config: what makes the site its own. The chrome, the theme glue and the Markdown
 * routes read it instead of holding Kiln's facts, so they can move into `@mitcsutt/kiln-docs`
 * (ADR 0045). Kiln's is `site.config.ts` at the app's root. It holds data only: client components
 * read it, so a function here would pull its imports into the browser.
 */
export interface SiteLink {
  href: string
  label: string
}

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
  /** The sections in the header, each a top-level folder of the docs. */
  nav: { sections: readonly SiteLink[] }
  footer: { text: string; links: readonly SiteLink[] }
  search: { placeholder: string }
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
