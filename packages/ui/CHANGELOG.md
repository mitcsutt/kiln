# @mitcsutt/kiln-ui

## 0.3.0

### Minor Changes

- 591b219: Add two theme presets, rework two others, and enforce the second-order AI design tells with a test. Each new or reworked theme takes its subject from a real object or standard, and every colour, face, radius and easing has a one-line reason in its stylesheet. See [ADR 0030](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0030-theme-family-without-ai-tells.md).

  - New preset `flightdeck`: a glass-cockpit display in B612 and B612 Mono, dark-first. Cyan marks what the pilot sets and acts on, the selected line is a neutral reverse-video box, and green, amber and red are status. Import `@mitcsutt/kiln-ui/themes/flightdeck.css`.
  - New preset `riso`: a two-drum risograph zine in fluorescent pink and blue, with screen tints instead of borders, Shantell Sans, and a hard offset only on floating layers. Import `@mitcsutt/kiln-ui/themes/riso.css`.
  - `paper` (the default) is reworked: an office print with white sheets on grey recycled stock in blue-black ink, set in Golos Text.
  - `ledger` is reworked: an accountant's columnar pad with a white sheet ruled in green, banknote-green actions, and figures set condensed in Archivo instead of in a monospace.
  - `monograph` and `fiesta` are unchanged.
  - `themes/tells.test.ts` checks Paper, Ledger, Flightdeck and Riso against the banned font list, the warm-cream canvas and the ember, terracotta and indigo accents. Monograph and Fiesta are exempt.

  ### Upgrading

  Nothing is renamed or removed, so no code changes are needed.

  - `paper` and `ledger` change appearance and fonts. Check any screen that depends on their old look.
  - Paper is now set in Golos Text, with Atkinson Hyperlegible Mono for code. Ledger is set in Archivo, with Atkinson Hyperlegible Mono for code. Flightdeck brings B612 and B612 Mono, and Riso brings Shantell Sans.
  - The base stylesheet no longer declares Schibsted Grotesk, Newsreader or Martian Mono. The Monograph and Fiesta presets now load them (Martian Mono for both), so an app that imports those presets sees no change. A custom theme that relied on these faces arriving with `styles.css` must load them itself or import the Monograph preset.

## 0.2.2

### Patch Changes

- 1ef6bf4: Each component's doc comment is now the text of its docs page: the summary is the page's description and `@remarks` its lead, so editor hovers match the docs. Older notes moved to `@privateRemarks`. The agent skills follow the regenerated pages, with the defaults components set in code now in their props tables, and the Section page a reference of the `layout-composition` skill.

## 0.2.1

### Patch Changes

- 4834a79: A soft `Badge` or `Tag` in a highlighted `Table` row or `List` item is legible in every theme and mode. The row already re-points the tone texts for its fill, and now tints the soft fills from that fill too; before, in Fiesta night, a caution badge on a gold row put the daytime ink on the night soft fill.
- 4834a79: A plain native `<select>`, such as your own control inside a `Field`, takes the theme's surface as its background. The reset already gave it the theme's ink, so in dark mode the browser's default grey box left the text short of AA contrast on some platforms.
- 4834a79: The agent skills' examples now declare each example as a named export (`export function Usage()`) instead of a default export, matching the docs, where the examples now sit beside the code they document. The examples are otherwise unchanged.

## 0.2.0

### Minor Changes

- b14cd6e: Add the `@mitcsutt/kiln-ui/theme-script` entry, which exports `themeScript` and `DEFAULT_STORAGE_KEY` with no React, so Node-side tooling (like a Vite config that writes the script into a static `index.html`) can load it. The single-page-app recipe on the getting-started page now imports from it. `themeScript` is still exported from the root entry too.
- b14cd6e: Add `storageKey` to `ThemeProvider` and `themeScript` (`themeScript(theme, defaultMode, { storageKey })`), so an app can keep the colour mode under its own `localStorage` key instead of the shared `kiln-color-mode`. The getting-started page also shows how a single-page app generates the script into its `index.html` at build time.

### Patch Changes

- b14cd6e: The README's agent-skills section now covers projects that already have an `intent.skills` list in `package.json`: add the package to the list, then check with `npx @tanstack/intent@latest list`.
