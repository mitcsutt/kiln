/**
 * A docs site's config: what makes the site its own. The chrome, the theme glue and the Markdown
 * routes read it instead of holding a site's facts. A site's is `site.config.ts` at its root.
 *
 * It holds data only: client components read it, so a function here would pull its imports into
 * the browser. It's also Node-loadable (ADR 0046): the `kiln-docs` bin loads it through esbuild,
 * so it uses no tsconfig path aliases and imports nothing plain Node can't load.
 */
import { KILN_UI_THEMES } from './themes.ts'

export interface SiteLink {
  href: string
  label: string
}

/**
 * A search backend: what the search route serves and the client the header queries (ADR 0049).
 *
 * - `'pagefind'`, the default: `kiln-docs postbuild` indexes the exported docs pages into
 *   `out/pagefind/`, and a search downloads only the index chunks it touches. Under `next dev`,
 *   which has no export, the header searches the search route's Orama index instead.
 * - `'orama-static'`: the search route exports one Orama index at build time, which the header
 *   downloads whole on the first search.
 */
export type SearchProvider = 'pagefind' | 'orama-static'

export const DEFAULT_SEARCH_PROVIDER: SearchProvider = 'pagefind'

/**
 * Where the search route is: `app/api/search/route.ts`. It serves the Orama index: in the build
 * for `'orama-static'`, and under `next dev` for `'pagefind'`.
 */
export const SEARCH_ROUTE = '/api/search'

/**
 * One theme for the whole site, with no picker: `theme: { fixed: 'flightdeck' }`. The head script
 * is kiln-ui's own `themeScript`, so only the colour mode is read from storage. The site imports
 * kiln-ui's `styles.css` and that theme's preset; Paper is in `styles.css` and needs none.
 */
export interface FixedTheme {
  fixed: string
  /** The colour mode toggle in the header. `false` leaves the header with no theme controls. */
  modeToggle?: boolean
  /**
   * The site's own themes, which its own stylesheets define. `defineSite` warns about a theme
   * that's neither kiln-ui's nor listed here.
   */
  custom?: readonly string[]
}

/**
 * A theme picker in the header, over `picker`, starting on `default`. The site imports the
 * stylesheet of each theme it lists.
 */
export interface ThemePicker {
  picker: readonly string[]
  default: string
  /**
   * The site's own themes, which its own stylesheets define. `defineSite` warns about a theme
   * that's neither kiln-ui's nor listed here.
   */
  custom?: readonly string[]
}

export interface SiteConfig {
  /** The wordmark, the title template, the sidebar's overview label and the `llms.txt` heading. */
  name: string
  /** The description in every page's metadata that doesn't set its own. */
  description: string
  /** Where the site is deployed, with no trailing slash. The Markdown's absolute links use it. */
  url: string
  repository: { url: string }
  /** One fixed theme (`FixedTheme`), or a picker in the header (`ThemePicker`). */
  theme: FixedTheme | ThemePicker
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
    /**
     * Where search runs: `'pagefind'`, the default, indexes the built pages in `kiln-docs
     * postbuild`, and `'orama-static'` exports one index at build time (`SearchProvider`).
     */
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

/**
 * The keys `defineSite` accepts at each level: `true` for a value it doesn't look inside, and
 * `[shape]` for a list of objects of that shape.
 */
interface Shape {
  [key: string]: true | Shape | [Shape]
}

const LINK: Shape = { href: true, label: true }

const SITE_SHAPE: Shape = {
  name: true,
  description: true,
  url: true,
  repository: { url: true },
  theme: true,
  nav: { sections: [LINK], labels: { pages: true, sections: true } },
  footer: { text: true, links: [LINK] },
  search: { placeholder: true, provider: true },
  notFound: { description: true, action: LINK },
  markdown: { llms: { intro: true, sections: true } },
  variants: true,
}

const FIXED_SHAPE: Shape = { fixed: true, modeToggle: true, custom: true }
const PICKER_SHAPE: Shape = { picker: true, default: true, custom: true }
const VARIANT_SHAPE: Shape = { label: true, values: true }

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

/** Each key in `value` that `shape` doesn't have, as a path from the config's root. */
function unknownKeys(value: unknown, shape: Shape, path: string): string[] {
  if (!isObject(value)) return []
  return Object.entries(value).flatMap(([key, child]) => {
    const at = path ? `${path}.${key}` : key
    const known = Object.hasOwn(shape, key) ? shape[key] : undefined
    if (!known) return [at]
    if (known === true) return []
    if (Array.isArray(known)) {
      return list(child).flatMap((item, index) =>
        unknownKeys(item, known[0], `${at}[${String(index)}]`),
      )
    }
    return unknownKeys(child, known, at)
  })
}

/** The keys a site's theme may have: those of a fixed theme, or those of a picker. */
function themeShape(theme: unknown): Shape {
  if (!isObject(theme)) return {}
  if ('fixed' in theme && 'picker' in theme) {
    throw new Error(
      "kiln-docs: site.config.ts sets both theme.fixed and theme.picker. A site has one fixed theme, { fixed: 'flightdeck' }, or a picker, { picker: [...], default: 'paper' }.",
    )
  }
  if (Array.isArray(theme.picker) && !theme.picker.includes(theme.default)) {
    throw new Error(
      `kiln-docs: site.config.ts starts the picker on ${String(theme.default)}, which theme.picker doesn't offer.`,
    )
  }
  return 'fixed' in theme ? FIXED_SHAPE : PICKER_SHAPE
}

/** The themes a site names that are neither kiln-ui's nor listed in `theme.custom`. */
function unstyledThemes(theme: unknown): string[] {
  if (!isObject(theme)) return []
  const names = 'fixed' in theme ? [theme.fixed] : [...list(theme.picker), theme.default]
  const known = [...KILN_UI_THEMES, ...list(theme.custom)]
  return [...new Set(names)].filter(
    (name): name is string => typeof name === 'string' && !known.includes(name),
  )
}

/**
 * Checks a site's config against `SiteConfig`, keeping its literal types.
 *
 * It's strict: a key `SiteConfig` doesn't have throws, so a key from an older shape (a top-level
 * `baseUrl`, say) fails loudly instead of being ignored (ADR 0047). It warns about a theme that's
 * neither kiln-ui's nor listed in `theme.custom`, since nothing would style it.
 */
export function defineSite<const Config extends SiteConfig>(config: Config): Config {
  const site: Record<string, unknown> = isObject(config) ? config : {}
  const unknown = [
    ...unknownKeys(site, SITE_SHAPE, ''),
    ...unknownKeys(site.theme, themeShape(site.theme), 'theme'),
    ...(isObject(site.variants)
      ? Object.entries(site.variants).flatMap(([axis, variant]) =>
          unknownKeys(variant, VARIANT_SHAPE, `variants.${axis}`),
        )
      : []),
  ]
  if (unknown.length) {
    const one = unknown.length === 1
    throw new Error(
      `kiln-docs: site.config.ts has ${one ? 'a key' : 'keys'} SiteConfig doesn't: ${unknown.join(', ')}. Remove ${one ? 'it' : 'them'}; SiteConfig in @mitcsutt/kiln-docs/config lists the keys a site sets.`,
    )
  }
  for (const name of unstyledThemes(site.theme)) {
    console.warn(
      `kiln-docs: the ${name} theme isn't one of kiln-ui's. If the site's own stylesheet defines it, list it in theme.custom.`,
    )
  }
  return config
}

/** Where a site's hand-written pages live, from its root. */
export const DEFAULT_CONTENT_DIR = 'content/docs'

/**
 * Where `writeGenerated()` writes a site's generated pages, from its root. It's a folder of its
 * own, because `.generated/` may hold a site's other build data, which emptying it would delete.
 */
export const DEFAULT_GENERATED_DIR = '.generated/pages'
