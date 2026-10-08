---
'@mitcsutt/kiln-ui': patch
---

A sized `Media` with a fixed `ratio` gives its image `width` and `height` attributes from its size and ratio, so the browser knows the image's box before it loads and audits no longer flag it as unsized. Its CSS still sets the rendered size, so layout doesn't change, and `imgProps.width`/`height` still win. With `ratio="auto"` the image's own ratio isn't known, so pass them in `imgProps`.
