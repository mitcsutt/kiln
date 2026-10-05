# @mitcsutt/kiln-ui

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
