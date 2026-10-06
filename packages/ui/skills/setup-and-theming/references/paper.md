<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Paper

> The neutral default. An office that prints for everyone, with white sheets on grey stock, blue-black ink as the accent and Golos Text for type.

Source: https://kiln.mitchellsutton.com/docs/ui/themes/paper

_An office that prints for everyone._ Paper is the theme you get when you set none. It's in the base stylesheet, and it's built to sit under any brand without arguing with it: white sheets on grey recycled stock, blue-black ink as the accent, and a typeface drawn for public services, so that everyone can read it.


## Use it

Paper needs no extra import and no `theme` prop:

```tsx
import '@mitcsutt/kiln-ui/styles.css'
import { ThemeProvider } from '@mitcsutt/kiln-ui'

;<ThemeProvider>…</ThemeProvider>
```

Paper is also declared on the document root at zero specificity, so a preset or a custom theme that leaves a token out falls back to Paper's value rather than to nothing.

## The idea, applied

- **Colour.** Cool grey stock for the canvas and near-white sheets for surfaces, so a surface reads against the page by fill alone. The primary action, the current item and live state are solid blue-black ink, and links are ink told apart by their underline. The one other hue is the proofreader's non-photo blue, kept for "you", the selected row and text selection. Tones are the only saturated colour on the page.
- **Type.** Golos Text for everything: text, headings, display, prose and figures. Atkinson Hyperlegible Mono for code. Paratype drew Golos for a national public-services website, so it has a plain zero, true tabular figures and distinct I, l and 1, and that is why it is here. The bundle has no italic file, so italics are synthesised. There is no serif. A 16px base on a 1.25 ratio.
- **Shape.** Square-shouldered actions and fields, slightly rounder surfaces, and pill chips as the one deliberate contrast. Round avatars.
- **Depth.** A fill change rather than a border: a sheet on stock needs no edge. Soft blue-black shadows for floating layers.
- **Motion.** A quart ease-out, brisk, with no bounce.

## All six themes

The same screen in each built-in theme, in the page's current mode:
