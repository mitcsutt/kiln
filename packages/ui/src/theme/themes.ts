/**
 * Registry of the themes Kiln ships. A theme is *only* CSS (see `src/themes/<name>.css`);
 * this list exists so TypeScript, Storybook and the docs agree on the built-in names.
 *
 * The runtime never checks a name against this list: `ThemeProvider`, `ThemeScope` and
 * `themeScript` only write `data-theme`, so a consumer's own theme (any string, styled by
 * their own `[data-theme='<name>']` stylesheet) works exactly like a built-in one.
 *
 * Adding a built-in: create `src/themes/<name>.css`, export it from `package.json` as an
 * opt-in preset, add it here. Nothing in `src/components/` should ever change for a new
 * theme.
 */
export const THEMES = ['paper', 'monograph', 'ledger', 'fiesta', 'flightdeck', 'riso'] as const

/** A theme that ships with Kiln. */
export type BuiltInThemeName = (typeof THEMES)[number]

/**
 * Any theme name: a built-in, or one you define in your own stylesheet. Built-in names
 * still autocomplete.
 */
export type ThemeName = BuiltInThemeName | (string & Record<never, never>)

/** Applied when no theme is set. Part of the base stylesheet; needs no extra import. */
export const DEFAULT_THEME = 'paper' satisfies BuiltInThemeName

export interface ThemeMeta {
  label: string
  description: string
  /** The stylesheet that defines the theme, or `null` when it's in the base stylesheet. */
  stylesheet: `@mitcsutt/kiln-ui/themes/${BuiltInThemeName}.css` | null
}

export const THEME_META: Record<BuiltInThemeName, ThemeMeta> = {
  paper: {
    label: 'Paper',
    description:
      'The neutral default, built for legibility. Blue-black ink on grey recycled stock with white sheets, Golos Text throughout.',
    stylesheet: null,
  },
  monograph: {
    label: 'Monograph',
    description:
      'A monograph read under a desk lamp at night. Blue-slate, one ember accent, a big serif display. Dark-first.',
    stylesheet: '@mitcsutt/kiln-ui/themes/monograph.css',
  },
  flightdeck: {
    label: 'Flightdeck',
    description:
      'A glass-cockpit display. Dark blue-grey glass, cyan for what you set, a reverse-video box for what you select, B612 throughout. Dark-first.',
    stylesheet: '@mitcsutt/kiln-ui/themes/flightdeck.css',
  },
  ledger: {
    label: 'Ledger',
    description:
      'A columnar accounting pad. Green rules on white, banknote-green actions, red negatives, condensed figures.',
    stylesheet: '@mitcsutt/kiln-ui/themes/ledger.css',
  },
  fiesta: {
    label: 'Fiesta',
    description:
      'A screen-printed festival poster. Flat spot inks, hard offsets, chunky condensed type, springy motion.',
    stylesheet: '@mitcsutt/kiln-ui/themes/fiesta.css',
  },
  riso: {
    label: 'Riso',
    description:
      'A two-drum risograph zine. Fluorescent pink and blue ink on white stock, screen tints instead of shadows, a hand-drawn face.',
    stylesheet: '@mitcsutt/kiln-ui/themes/riso.css',
  },
}

export const MODES = ['system', 'light', 'dark'] as const
export type ColorMode = (typeof MODES)[number]
