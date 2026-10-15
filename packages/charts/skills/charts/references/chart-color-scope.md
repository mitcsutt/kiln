<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# ChartColorScope

> Gives a series the same colour in every chart inside it.

Source: https://kiln.mitchellsutton.com/docs/charts/building-blocks/chart-color-scope

Without a scope, each chart colours its own series in order: `cat-1`, `cat-2`, and so on. Put a dashboard's charts in one `ChartColorScope` and a key keeps its colour everywhere, so "Harbour Street" is the same colour in the revenue chart, the orders chart and their legends. Keys take `--color-cat-1` to `--color-cat-8` in the order the charts first show them. Pin a colour with `colors`, or on the series itself with `color`; pins win.

The scope renders no element of its own.

`order` colours keys in a fixed order, whichever chart draws first; `colors` pins a colour. Harbour and Quay match across both charts.

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

## API

`ChartColorScopeProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `colors` | `Readonly<Record<string, ChartColor>>` |  | Colours fixed for some keys, across every chart inside. An automatic colour skips the categorical slots these hold. |
| `order` | `readonly string[]` |  | Keys to colour first, in this order, so the colours don't depend on which chart renders first. Keys not listed take the next free colour when a chart first shows them. |
| `children` | `ReactNode` |  |  |
