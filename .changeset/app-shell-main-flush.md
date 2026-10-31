---
'@mitcsutt/kiln-ui': minor
---

`AppShell.Main` takes a `flush` prop that drops its default padding at the top and the end, for pages that space themselves (full-bleed `Section` bands, say), with no CSS. Without it, Main pads as before, and `--app-shell-main-padding` still sets the padding.
