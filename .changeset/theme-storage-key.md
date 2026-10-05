---
'@mitcsutt/kiln-ui': minor
---

Add `storageKey` to `ThemeProvider` and `themeScript` (`themeScript(theme, defaultMode, { storageKey })`), so an app can keep the colour mode under its own `localStorage` key instead of the shared `kiln-color-mode`. The getting-started page also shows how a single-page app generates the script into its `index.html` at build time.
