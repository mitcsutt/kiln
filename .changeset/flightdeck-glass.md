---
'@mitcsutt/kiln-ui': minor
---

Flightdeck has new colours, with dark mode designed first. Check screens that depend on its old look.

- **Night glass.** The dark canvas is blue-grey glass at OKLCH L 0.19, with a deeper ladder (sunken 0.165, surface 0.225, raised 0.262), so a popover reads above a card without a shadow. Ink is held at L 0.94 instead of white so it doesn't halate.
- **Day mode.** A cool grey case (0.933) holds white sheets (0.993). It no longer shares a light canvas with Paper.
- **Focus is cyan, not ink.** `--color-focus` is the theme's cyan, a step lighter than the cyan fill at night (`oklch(0.86 0.12 208)`) and darkened by day (`oklch(0.52 0.092 215)`). It reaches at least 7.9:1 on every fill a ring sits beside at night and 3.6:1 by day, and stays clear of the green and red status tones.
- **Data colours.** Categorical colours no longer use the status hues (green, amber, red) and series one is blue, not cyan. The sequential ramp is cyan, and the diverging ramp is magenta against cyan.
- **Status tones** are refitted to AA on every ground, their soft fill and the highlight.

DESIGN.md's "focus is neutral" rule is replaced by [ADR 0052](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0052-focus-takes-the-theme-hue.md): a theme's focus may take its own hue, provided it reaches 3:1 on every fill it sits beside and can't be mistaken for validation. A new theme test checks both.
