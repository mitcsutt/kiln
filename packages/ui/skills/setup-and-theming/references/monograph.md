<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Monograph

> A scholarly monograph read under a desk lamp at night. Blue slate, one ember accent, a big serif display. Dark-first.

Source: https://kiln.mitchellsutton.com/docs/ui/themes/monograph

_A scholarly monograph read under a desk lamp at night._ Modern nostalgia: blue slate rather than black, a single ember accent that behaves like phosphor, and a serif display set big and tight over a newsroom grotesk.


## Use it

Monograph is a preset, so import its stylesheet. It's dark-first, so pair it with `defaultMode="dark"`, and give `themeScript` the same:

```tsx
import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-ui/themes/monograph.css'
import { ThemeProvider, themeScript } from '@mitcsutt/kiln-ui'

;<html lang="en">
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeScript('monograph', 'dark') }} />
  </head>
  <body>
    <ThemeProvider theme="monograph" defaultMode="dark">
      …
    </ThemeProvider>
  </body>
</html>
```

## The idea, applied

- **Colour.** Blue-slate neutrals (hue 255, never black). One ember accent (`oklch(0.72 0.15 52)` in dark, `oklch(0.565 0.158 44)` in light) that marks what's live and current, and never decorates. A cool slate highlight.
- **Type.** Newsreader for display and prose (optical sizes, set big at weight around 430 with −0.035em tracking) and Schibsted Grotesk for text and interface. Martian Mono only for code. A 17px base on a 1.25 ratio.
- **Shape.** Pill actions, 8px fields, 12px surfaces, rounded-square avatars.
- **Depth.** Hairlines only. Soft tinted shadows for floating layers.
- **Motion.** A quint ease-out with no bounce, slightly slow (`--motion-scale: 1.1`).
