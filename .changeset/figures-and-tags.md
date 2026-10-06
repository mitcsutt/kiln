---
'@mitcsutt/kiln-ui': minor
---

Small additions for figures, times and tags:

- `Numeral` takes `annotation`, a small muted figure after the main one in the same `<data>` element ("1 (4)").
- `Numeral` and `Text` take `tone="highlight"`, which sets the figure or text on the theme's highlight, like a marker pen.
- `RelativeTime` takes `justNowWithin` (seconds) and `justNowLabel` (default "just now"), for moments `Intl` would call "now" or "in 30 sec".
- `Tag` takes `size="sm"` for dense lists. `TagSize` is exported.
- The `Numeral` docs explain how to query a figure in tests: its sign and decimal mark are separate spans, so match the `<data>` element.
