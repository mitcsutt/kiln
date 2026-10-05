---
'@mitcsutt/kiln-ui': patch
---

A plain native `<select>`, such as your own control inside a `Field`, takes the theme's surface as its background. The reset already gave it the theme's ink, so in dark mode the browser's default grey box left the text short of AA contrast on some platforms.
