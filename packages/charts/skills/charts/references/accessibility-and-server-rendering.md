<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Accessibility and server rendering

> What every chart gives screen reader and keyboard users, how charts render on the server, and what you still decide.

Source: https://kiln.mitchellsutton.com/docs/charts/getting-started/accessibility-and-server-rendering

## What readers get

- **A name and a summary.** Every chart is a figure named by `label`. Write the label as a caption would read: "Revenue by month, 2026". The figure is described by `summary`, or by a summary written from the data: how many series and points, and each series' lowest and highest value. Write your own when the chart has a point to make ("Revenue grew every month but February").
- **The data as a table.** A visually hidden table lists every value, one row per point and one column per series, with the same formatting as the tooltip. `BarList` and `Heatmap` show their data as text already, so they need none.
- **Keyboard reading.** Tab to a chart's plot and the left and right arrow keys move between points; the tooltip is a live region, so a screen reader reads each point as it's reached. Enter or Space activates the point for `onPointClick`. In a `Heatmap`, the arrow keys move between cells.
- **Zoom without a pointer.** In a `TimeSeries`, hold Shift with the arrow keys to select a range and press Enter to zoom in; Escape clears the selection, and "Show all" resets.
- **Quiet legends.** Legend swatches are hidden from screen readers, because the series' name says it all. Legend entries are toggle buttons with a pressed state.
- **No motion on request.** Marks don't animate under `prefers-reduced-motion`.

Colour is never the only signal: series have names in the legend and the tooltip, and every value is in the table.

## Server rendering

The chart engine behind `Chart`, `TimeSeries` and `Bars` draws only in the browser. On the server those charts render their frame at its full `height`, the legend and the data table, so the page reads correctly before it hydrates and nothing moves when the plot draws into the reserved space. `Sparkline`, `Heatmap`, `Share` and `BarList` are plain SVG and HTML, and render completely on the server.

Pass `locale` and `timeZone` to a chart that renders on the server, so the dates and numbers in its server HTML match what the browser writes.

## Sizing

A chart fills its width and takes `height` in pixels, legend included. Pass `height="fill"` to fill a parent that has a height, such as a grid cell; the chart redraws as the cell is resized.

```tsx
import { Chart } from '@mitcsutt/kiln-charts'
import { Grid } from '@mitcsutt/kiln-ui'

export function States() {
  return (
    <Grid columns={{ base: 1, md: 3 }} gap={5}>
      <Chart data={[]} x="month" label="Revenue by month" status="loading" height={180}>
        <Chart.Bar dataKey="revenue" />
      </Chart>
      <Chart
        data={[]}
        x="month"
        label="Refunds by month"
        emptyMessage="No refunds this quarter"
        height={180}
      >
        <Chart.Bar dataKey="refunds" />
      </Chart>
      <Chart
        data={[]}
        x="month"
        label="Payouts by month"
        status="error"
        errorMessage="Payouts didn’t load"
        height={180}
      >
        <Chart.Bar dataKey="payouts" />
      </Chart>
    </Grid>
  )
}
```

Loading, empty and error states take the chart's place at the same size, with text a screen reader announces.
