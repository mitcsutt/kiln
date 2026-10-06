---
'@mitcsutt/kiln-ui': patch
---

`AppShell.Header` no longer covers in-page link and `scrollIntoView` targets. While it's sticky, it measures its own height and sets the document's `scroll-padding-block-start` to match, and the sidebar's sticky offset follows the same measurement, so a header taller than `--app-shell-header-height` is accounted for. Both are removed on unmount or with `sticky={false}`.
