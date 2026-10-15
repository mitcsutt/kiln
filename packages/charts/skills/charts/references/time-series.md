<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# TimeSeries

> Values over time: one line or area per series, on a shared time axis, with a tooltip, a legend and drag-to-zoom.

Source: https://kiln.mitchellsutton.com/docs/charts/presets/time-series

`TimeSeries` is the chart for anything measured over time: revenue by month, sign-ups by day, response times by hour. Pass rows with a date and a value per series (or long rows and `pivot`), and it plots every numeric key unless you name the `series`.

Readers can zoom into a range by dragging across the plot. From the keyboard, focus the chart, hold Shift and press the arrow keys to select a range, and press Enter to zoom in. A "Show all" button resets the zoom, and `onZoom` reports each range.

Points sit evenly along the axis, one per row. For a gap in time, include a row whose values are missing: lines break there rather than joining across it.

`TimeSeries` is a short composition of [Chart](./chart.md) parts. When you need something it doesn't do, copy its source and change it: that's what it's for.

Rows with a date and a value per series. Every numeric key is plotted unless you name the `series`, and readers can drag across the plot to zoom.

```tsx
import { TimeSeries } from '@mitcsutt/kiln-charts'

export function Usage() {
  return (
    <TimeSeries
      data={[
        { day: '2026-03-02', signups: 42, trials: 18 },
        { day: '2026-03-03', signups: 51, trials: 22 },
        { day: '2026-03-04', signups: 47, trials: 19 },
        { day: '2026-03-05', signups: 63, trials: 27 },
        { day: '2026-03-06', signups: 58, trials: 31 },
        { day: '2026-03-07', signups: 34, trials: 12 },
        { day: '2026-03-08', signups: 29, trials: 10 },
        { day: '2026-03-09', signups: 61, trials: 26 },
      ]}
      x="day"
      label="Sign-ups and trials by day"
      series={[
        { key: 'signups', label: 'Sign-ups' },
        { key: 'trials', label: 'Started a trial' },
      ]}
      height={260}
    />
  )
}
```

## Stacked areas

`variant="stacked"` stacks areas into a total; `format` and `locale` write every value.

```tsx
import { TimeSeries } from '@mitcsutt/kiln-charts'

export function Stacked() {
  return (
    <TimeSeries
      data={[
        { month: '2026-01-01', subscriptions: 31200, services: 8400, hardware: 4100 },
        { month: '2026-02-01', subscriptions: 33800, services: 7900, hardware: 5200 },
        { month: '2026-03-01', subscriptions: 35100, services: 9600, hardware: 3800 },
        { month: '2026-04-01', subscriptions: 37400, services: 10100, hardware: 4600 },
      ]}
      x="month"
      xFormat="month"
      variant="stacked"
      label="Revenue by stream, January to April"
      format={{ style: 'currency', currency: 'EUR', notation: 'compact' }}
      locale="de-DE"
      height={260}
    />
  )
}
```

## Against last year

A dashed series for a comparison, such as last year. Long rows work too: `pivot` turns one row per day and year into a series per year.

```tsx
import { TimeSeries } from '@mitcsutt/kiln-charts'

export function Comparison() {
  return (
    <TimeSeries
      data={[
        { week: '2026-02-02', year: '2026', visits: 1820 },
        { week: '2026-02-09', year: '2026', visits: 2140 },
        { week: '2026-02-16', year: '2026', visits: 1990 },
        { week: '2026-02-23', year: '2026', visits: 2410 },
        { week: '2026-02-02', year: '2025', visits: 1610 },
        { week: '2026-02-09', year: '2025', visits: 1700 },
        { week: '2026-02-16', year: '2025', visits: 1880 },
        { week: '2026-02-23', year: '2025', visits: 1760 },
      ]}
      x="week"
      pivot={{ by: 'year', value: 'visits' }}
      series={[
        { key: '2026', label: 'This year' },
        { key: '2025', label: 'Last year', color: 'neutral', variant: 'dashed' },
      ]}
      label="Weekly visits, this year against last"
      height={240}
    />
  )
}
```

## Composition

```tsx
<Chart data={rows} x={x} label={label} height={height}>
  <Chart.Grid />
  <Chart.XAxis />
  <Chart.YAxis />
  {series.map((s) => <Chart.Line key={s.key} dataKey={s.key} label={s.label} color={s.color} />)}
  <Chart.Tooltip />
  <Chart.Legend />
  <Chart.Zoom value={zoom} onZoom={onZoom} />
</Chart>
```

## API

`TimeSeriesProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `series` | `readonly TimeSeriesSeries[]` |  | The series to plot. Defaults to every numeric key in the rows (or every series `pivot` makes), in order. |
| `variant` | `'area' \| 'line' \| 'stacked'` | `'line'` | `line` for values to compare, `area` for one or two totals, `stacked` for parts that add up to a whole over time. |
| `curve` | `'step' \| 'linear' \| 'smooth'` | `'linear'` |  |
| `legend` | `boolean` | `true when there's more than one series` | Show the legend. |
| `zoomable` | `boolean` | `true` | Let readers zoom into a range by dragging, or with Shift and the arrow keys. |
| `zoom` | `ChartZoomRange \| null` |  | The zoomed range, when you control it. `null` shows everything. |
| `onZoom` | `(range: ChartZoomRange \| null) => void` |  | Called with the range a reader zooms to, or `null` when they reset. |
| `onPointClick` | `ChartProps['onPointClick']` |  | Called when a reader clicks a point, or activates it from the keyboard. |
| `label` (required) | `string` |  | The chart's accessible name: what it shows, such as "Revenue by month". |
| `x` (required) | `string` |  | The key of each row's x value: a category, or a date (a `Date` or an ISO 8601 string). |
| `format` | `ValueFormat` | `'number'` | How to write values. |
| `locale` | `string` |  | The locale for every number and date, passed to `Intl`. Defaults to the reader's. |
| `data` (required) | `readonly ChartRow[]` |  | The rows to plot. Wide rows have one key per series (`{ month: 'Mar', revenue: 1200 }`); long rows have one row per series and x, and need `pivot`. |
| `summary` | `string` |  | What the data says, read after the name. Defaults to a summary of each series' range. |
| `animate` | `boolean` | `true` | Animate marks in and between data. Never under reduced motion. |
| `status` | `'loading' \| 'error' \| 'empty' \| 'ready'` |  | Shows a loading, empty or error state in place of the chart. Empty data shows `empty`. |
| `height` | `ChartHeight` | `240` | Pixels, legend included, or `fill` to fill a sized parent. |
| `emptyMessage` | `ReactNode` | `'No data to show'` |  |
| `action` | `ReactNode` |  | One thing to do from the empty or error state, such as a retry button. |
| `pivot` | `PivotOptions` |  | Turn long rows into wide ones, one series per value of `by`. |
| `xFormat` | `XFormat` | `'date'` | How to write x values that are dates. |
| `xLabel` | `string` |  | The x column's header in the data table. Defaults to a readable form of `x`. |
| `timeZone` | `string` |  | The time zone dates print in, passed to `Intl`. Defaults to the reader's. |
| `errorMessage` | `ReactNode` | `"This chart couldn't load"` |  |
| `engineProps` | `EngineProps` |  | Props for the engine's own chart component. Outside semver. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`TimeSeriesSeries`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'dashed'` |  | `dashed` for a target, a forecast or last year. Lines only. |
| `key` (required) | `string` |  | The key of this series' values in each row. |
| `label` | `string` |  | Its name in the legend, tooltip and table. Defaults to a readable form of `key`. |
| `color` | `ChartColor` |  | A theme colour or any CSS colour. Defaults to the next categorical colour. |
| `format` | `ValueFormat` |  | How to write this series' values, when it differs from the chart's `format`. |

`ChartZoomRange`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `from` (required) | `unknown` |  |  |
| `to` (required) | `unknown` |  |  |

`ChartProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `readonly ChartRow[]` |  | The rows to plot. Wide rows have one key per series (`{ month: 'Mar', revenue: 1200 }`); long rows have one row per series and x, and need `pivot`. |
| `x` (required) | `string` |  | The key of each row's x value: a category, or a date (a `Date` or an ISO 8601 string). |
| `label` (required) | `string` |  | The chart's accessible name: what it shows, such as "Revenue by month". |
| `summary` | `string` |  | What the data says, read after the name. Defaults to a summary of each series' range. |
| `height` | `ChartHeight` | `240` | Pixels, legend included, or `fill` to fill a sized parent. |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | `vertical` runs the chart sideways: categories down the side and bars across. |
| `pivot` | `PivotOptions` |  | Turn long rows into wide ones, one series per value of `by`. |
| `format` | `ValueFormat` | `'number'` | How to write values. |
| `xFormat` | `XFormat` | `'date'` | How to write x values that are dates. |
| `xLabel` | `string` |  | The x column's header in the data table. Defaults to a readable form of `x`. |
| `locale` | `string` |  | The locale for every number and date, passed to `Intl`. Defaults to the reader's. |
| `timeZone` | `string` |  | The time zone dates print in, passed to `Intl`. Defaults to the reader's. |
| `stacking` | `'normal' \| 'percent'` | `'normal'` | `percent` stacks to 100%, showing each series' share. |
| `animate` | `boolean` | `true` | Animate marks in and between data. Never under reduced motion. |
| `status` | `'loading' \| 'error' \| 'empty' \| 'ready'` |  | Shows a loading, empty or error state in place of the chart. Empty data shows `empty`. |
| `emptyMessage` | `ReactNode` | `'No data to show'` |  |
| `errorMessage` | `ReactNode` | `"This chart couldn't load"` |  |
| `action` | `ReactNode` |  | One thing to do from the empty or error state, such as a retry button. |
| `onPointClick` | `(point: ChartPoint) => void` |  | Called when a reader clicks a point, or presses Enter or Space on the active point when the chart has keyboard focus. |
| `engineProps` | `EngineProps` |  | Props for the engine's own chart component. Outside semver. |
| `children` | `ReactNode` |  | The chart's parts: series, axes, grid, reference lines, tooltip, legend, zoom. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`PivotOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `by` (required) | `string` |  | The key whose values become the series (`'region'`). |
| `value` (required) | `string` |  | The key that holds each series' value (`'sales'`). |
| `limit` | `number \| false` | `7` | How many series to keep before grouping the rest as one "Other" series. They are ranked by their total. With 8 or fewer there's nothing to group. `false` keeps every series. |
| `other` | `string` | `'Other'` | The name of the grouped series, which the chart colours neutral. |
