---
'@mitcsutt/kiln-ui': minor
---

Paper, the default theme, is rebuilt as "Office ink": neutral grey stock with white sheets, and blue-black fountain-pen ink as its only hue, which is also the accent, so a brand colour can replace it without a fight.

- **Dark mode** is neutral graphite rather than blue-slate, with wider steps between layers (sunken, canvas, sheet, raised) so each one reads by lightness alone. The accent is a mid ink-blue with dark text on it, rather than a pastel.
- **Light mode** keeps grey stock under near-white sheets. The ink carries a little less blue, the accent is a step lighter and brighter, and the lines are a neutral grey.
- **Focus** is the fountain-pen ink at full saturation, blue rather than black, in both modes. It clears 3:1 against every fill a ring sits beside and keeps well clear of the red and green tones. DESIGN.md's focus rule changes to match: focus takes the theme's own hue, not its ink (ADR 0052). A new `themes/focus.test.ts` checks both rules for every built-in theme.
- **Tones, categorical colours, strokes, ramps and chart chrome** are retuned to the new neutrals. Categorical colours now sit at one lightness and chroma, ordered so neighbours sit far apart in hue.

Apps that set no theme, or `theme="paper"`, get the new look on upgrade. Fonts, type, radii, motion and shadows are unchanged.
