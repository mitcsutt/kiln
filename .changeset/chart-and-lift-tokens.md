---
'@mitcsutt/kiln-ui': minor
---

Add data and drag tokens to the theme contract, set by every built-in theme in light and dark: a sequential ramp (`--color-seq-1` to `--color-seq-7`), a diverging ramp about a neutral midpoint (`--color-div-neg-3` to `--color-div-pos-3`, with `--color-div-mid`), a stroke variant of each categorical colour (`--color-cat-1-stroke` to `--color-cat-8-stroke`), chart chrome (`--chart-grid`, `--chart-axis`, `--chart-label`, `--chart-tooltip-surface`, `--chart-tooltip-border`, `--chart-tooltip-ink`, `--chart-focus`) and `--shadow-lift` for an item picked up to be dragged. No existing token changes value. A custom theme that doesn't set the new tokens falls back to Paper's values at the document root.
