---
'@mitcsutt/kiln-ui': minor
---

Add the `@mitcsutt/kiln-ui/theme-script` entry, which exports `themeScript` and `DEFAULT_STORAGE_KEY` with no React, so Node-side tooling (like a Vite config that writes the script into a static `index.html`) can load it. The single-page-app recipe on the getting-started page now imports from it. `themeScript` is still exported from the root entry too.
