<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Colour

> Categorical colours for who a series is, ramps for how much, tones for status, and the same colours across a dashboard.

Source: https://kiln.mitchellsutton.com/docs/charts/getting-started/colour

Charts colour by token, so every colour follows the theme and the colour mode. Pass any of these as a series' or mark's `color`:

- **`cat-1` to `cat-8`**: the categorical colours, for **who or what** a series is: a team, a region, a channel. They carry no order, so never use them for an amount. A series takes the next one by default.
- **`seq-1` to `seq-7`**: the sequential ramp, for **how much**: more data sits further from the page. `Heatmap` and `BarList` use it.
- **`div-neg-3` to `div-pos-3`**: the diverging ramp, for values **either side of a reference**, with the neutral `div-mid` as the reference itself.
- **`positive`, `caution`, `critical`, `info`**: the status tones, only when the series is a status.
- **`accent`** for the one series that matters most, and **`neutral`** for context such as a target, last year or "Other".

Any CSS colour works too, for data that carries its own colours, but lead with the tokens.

Text never takes a series colour. Tick labels, legends and tooltips stay in the theme's chart ink, so they meet contrast in every theme, and each series carries a swatch beside its name. Lines and outlines use each categorical colour's stroke variant (`--color-cat-N-stroke`), darker than its fill, so a pale series still reads as a thin line.

## The same colour everywhere

Without a scope, each chart colours its own series from `cat-1`. Wrap a dashboard in `ChartColorScope` and a key keeps one colour in every chart inside, its legends included:

```tsx
import { ChartColorScope, TimeSeries } from '@mitcsutt/kiln-charts'
import { Grid } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <ChartColorScope order={['Harbour', 'Quay', 'Riverside']} colors={{ Docklands: 'cat-8' }}>
      <Grid columns={{ base: 1, md: 2 }} gap={6}>
        <TimeSeries
          data={[
            { day: '2026-03-02', Quay: 18, Harbour: 30, Docklands: 9 },
            { day: '2026-03-03', Quay: 22, Harbour: 26, Docklands: 12 },
            { day: '2026-03-04', Quay: 19, Harbour: 33, Docklands: 14 },
          ]}
          x="day"
          label="Deliveries by depot"
          zoomable={false}
          height={220}
        />
        <TimeSeries
          data={[
            { day: '2026-03-02', Riverside: 3, Harbour: 4 },
            { day: '2026-03-03', Riverside: 5, Harbour: 6 },
            { day: '2026-03-04', Riverside: 2, Harbour: 3 },
          ]}
          x="day"
          label="Late deliveries by depot"
          zoomable={false}
          height={220}
        />
      </Grid>
    </ChartColorScope>
  )
}
```

Keys take colours in the order charts first show them. Pass `order` to fix that order, and `colors` to pin a colour to a key. A series' own `color` wins over both, in its chart.
