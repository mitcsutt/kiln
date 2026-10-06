<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Riso

> A two-drum risograph zine. Fluorescent pink and blue on white stock, screen tints instead of borders, and Shantell Sans.

Source: https://kiln.mitchellsutton.com/docs/ui/themes/riso

_A two-drum risograph zine._ A riso print can't do gradients or soft shadows. It does flat spot ink, screen tints and the occasional misregistration, so that is all Riso uses: two inks on bright white stock, set in a typeface drawn from handwriting.


## Use it

```tsx
import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-ui/themes/riso.css'
import { ThemeProvider } from '@mitcsutt/kiln-ui'

;<ThemeProvider theme="riso" defaultMode="light">
  …
</ThemeProvider>
```

Riso's face is declared in its own stylesheet, so it costs nothing unless you import it. It's light-first, and dark mode is the deep-blue-stock edition.

## The idea, applied

- **Colour.** Two drums: fluorescent pink is the accent and blue is the text colour, on bright white stock. Surfaces are screen tints (a percentage of an ink) rather than borders. The highlight is an overprint: a pink tint under blue ink. Night mode is the same two inks printed on deep blue stock, not black.
- **Type.** Shantell Sans for every role except code, drawn from the artist Shantell Martin's own handwriting. It has no tabular figures, so numerals are not column-aligned. Atkinson Hyperlegible Mono is for code. A 1.25 ratio.
- **Shape.** Hand-cut and mixed: generous radii on actions and surfaces, smaller radii on fields, and pill chips.
- **Depth.** A fill change, with no shadow on static surfaces. The one misregistered moment is a hard pink offset on floating layers, as if the second drum printed slightly off.
- **Motion.** A mild spring: things land with a small overshoot.
