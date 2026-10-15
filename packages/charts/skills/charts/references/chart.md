<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Chart

> A chart you compose from parts: series of bars, lines and areas, mixed freely, on a shared x axis.

Source: https://kiln.mitchellsutton.com/docs/charts/primitives/chart

Reach for a preset first ([TimeSeries](./time-series.md) or [Bars](./bars.md)): they are compositions of these parts, and their source is the starting point to copy when you need something they don't do. Compose a `Chart` when you want to mix kinds, say bars for revenue with a line for the target.

Give the chart its rows, the key of `x`, an accessible `label` and a `height`, then its parts:

- **Series:** `Chart.Bar`, `Chart.Line` and `Chart.Area`, each with the `dataKey` it plots. They take the next categorical colour, or the one you pin with `color`.
- **Chrome:** `Chart.Grid`, `Chart.XAxis`, `Chart.YAxis` and `Chart.ReferenceLine`, drawn in the theme's chart tokens.
- **Reading:** `Chart.Tooltip` (one card for every series at the point, with a guide) and `Chart.Legend` (names and colours, as toggles that show and hide each series).
- **Zooming:** `Chart.Zoom` lets readers drag across a range, or select one from the keyboard.

Series parts must be children of the `Chart` (or inside a fragment), because the chart reads them to build the legend, the tooltip and the data table.

Give the chart its rows, the key of `x` and an accessible `label`, then compose its parts: series, chrome and the tooltip and legend. Kinds mix freely: here bars for revenue and a dashed line for the target.

```tsx
import { Chart } from '@mitcsutt/kiln-charts'

export function Usage() {
  return (
    <Chart
      data={[
        { month: '2026-01-01', revenue: 18200, target: 20000 },
        { month: '2026-02-01', revenue: 21400, target: 20000 },
        { month: '2026-03-01', revenue: 19800, target: 21000 },
        { month: '2026-04-01', revenue: 24600, target: 21000 },
        { month: '2026-05-01', revenue: 26100, target: 22000 },
        { month: '2026-06-01', revenue: 23900, target: 22000 },
      ]}
      x="month"
      xFormat="month"
      label="Revenue against target, first half of 2026"
      format={{ style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }}
      locale="en-AU"
      height={260}
    >
      <Chart.Grid />
      <Chart.XAxis />
      <Chart.YAxis format="compact" />
      <Chart.Bar dataKey="revenue" />
      <Chart.Line dataKey="target" variant="dashed" color="neutral" />
      <Chart.Tooltip />
      <Chart.Legend />
    </Chart>
  )
}
```

## Stacked areas and a reference line

Areas stack with `stack`; a reference line marks a value with a label. Colours come from the theme: `cat-*` for who a series is, the tones for status, `neutral` for context.

```tsx
import { Chart } from '@mitcsutt/kiln-charts'

export function StackedAreas() {
  return (
    <Chart
      data={[
        { week: 'Wk 14', tickets: 120, chats: 64, calls: 31 },
        { week: 'Wk 15', tickets: 132, chats: 71, calls: 28 },
        { week: 'Wk 16', tickets: 118, chats: 80, calls: 35 },
        { week: 'Wk 17', tickets: 141, chats: 92, calls: 30 },
        { week: 'Wk 18', tickets: 150, chats: 88, calls: 26 },
      ]}
      x="week"
      label="Support contacts by channel, weeks 14 to 18"
      height={260}
    >
      <Chart.Grid />
      <Chart.XAxis />
      <Chart.YAxis />
      <Chart.Area dataKey="tickets" stack />
      <Chart.Area dataKey="chats" stack />
      <Chart.Area dataKey="calls" stack />
      <Chart.ReferenceLine value={250} label="Staffed for 250" color="caution" />
      <Chart.Tooltip />
      <Chart.Legend />
    </Chart>
  )
}
```

## Sideways, stacked to 100%

`layout="vertical"` runs the chart sideways, which suits long category names. `stacking="percent"` stacks each row to 100%, so the axis reads shares while the tooltip and table keep the values.

```tsx
import { Chart } from '@mitcsutt/kiln-charts'

export function Sideways() {
  return (
    <Chart
      data={[
        { team: 'Platform and infrastructure', done: 42, open: 8 },
        { team: 'Payments', done: 31, open: 12 },
        { team: 'Mobile apps', done: 27, open: 19 },
      ]}
      x="team"
      label="Issues closed and open by team"
      layout="vertical"
      stacking="percent"
      height={220}
    >
      <Chart.Grid />
      <Chart.XAxis format="percent" />
      <Chart.YAxis />
      <Chart.Bar dataKey="done" label="Closed" color="positive" stack />
      <Chart.Bar dataKey="open" color="neutral" stack />
      <Chart.Tooltip />
      <Chart.Legend />
    </Chart>
  )
}
```

## Long rows with pivot

Long rows (one row per month and region) become one series per region with `pivot`. Past eight regions, the smallest group as a neutral "Other".

```tsx
import { Chart } from '@mitcsutt/kiln-charts'

export function Pivot() {
  return (
    <Chart
      data={[
        { month: 'Apr', region: 'Harbour', orders: 412 },
        { month: 'Apr', region: 'Quay', orders: 288 },
        { month: 'Apr', region: 'Northgate', orders: 190 },
        { month: 'May', region: 'Harbour', orders: 455 },
        { month: 'May', region: 'Quay', orders: 301 },
        { month: 'May', region: 'Northgate', orders: 214 },
      ]}
      x="month"
      pivot={{ by: 'region', value: 'orders' }}
      label="Orders by region, April and May"
      height={240}
    >
      <Chart.Grid />
      <Chart.XAxis />
      <Chart.YAxis />
      <Chart.Bar dataKey="Harbour" />
      <Chart.Bar dataKey="Quay" />
      <Chart.Bar dataKey="Northgate" />
      <Chart.Tooltip />
      <Chart.Legend />
    </Chart>
  )
}
```

## Same colours across charts

In a `ChartColorScope`, a key keeps its colour in every chart: Harbour is the same colour in both, though it's second in one and first in the other.

```tsx
import { Chart, ChartColorScope } from '@mitcsutt/kiln-charts'
import { Grid } from '@mitcsutt/kiln-ui'

export function ColourScope() {
  return (
    <ChartColorScope>
      <Grid columns={{ base: 1, md: 2 }} gap={6}>
        <Chart
          data={[
            { day: 'Mon', Quay: 12, Harbour: 30 },
            { day: 'Tue', Quay: 18, Harbour: 26 },
            { day: 'Wed', Quay: 15, Harbour: 33 },
          ]}
          x="day"
          label="Deliveries by depot"
          height={200}
        >
          <Chart.XAxis />
          <Chart.YAxis />
          <Chart.Line dataKey="Quay" />
          <Chart.Line dataKey="Harbour" />
          <Chart.Legend toggle={false} />
        </Chart>
        <Chart
          data={[
            { day: 'Mon', Harbour: 4, Riverside: 2 },
            { day: 'Tue', Harbour: 6, Riverside: 3 },
            { day: 'Wed', Harbour: 3, Riverside: 5 },
          ]}
          x="day"
          label="Late deliveries by depot"
          height={200}
        >
          <Chart.XAxis />
          <Chart.YAxis />
          <Chart.Bar dataKey="Harbour" />
          <Chart.Bar dataKey="Riverside" />
          <Chart.Legend toggle={false} />
        </Chart>
      </Grid>
    </ChartColorScope>
  )
}
```

## States

The loading, empty and error states sit in the chart's reserved space, with text a screen reader announces.

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

## Accessibility

The chart is a figure named by `label` and described by `summary`, or by a summary written from the data. A visually hidden table holds every value, for screen readers and for the server-rendered page. With the chart focused, the left and right arrow keys move between points and the tooltip reads each one out; Enter or Space activates the point for `onPointClick`. Marks don't animate under reduced motion.

## Server rendering

The chart engine draws only in the browser, so the server renders the frame at its full height, the legend and the data table. The plot draws once the page hydrates, into the space already reserved, so nothing on the page moves.

## API

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
| `timeZone` | `string` |  | The time zone instants print in, passed to `Intl`: `Date` objects and date strings with `Z` or an offset. A date string with no offset prints as written. Defaults to the reader's. |
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

`ChartBarProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `stack` | `string \| boolean` |  | Stack this bar on others with the same stack id (`true` is one shared stack). |
| `dataKey` (required) | `string` |  | The key of this series' values in each row. |
| `label` | `string` |  | The series' name in the legend, the tooltip and the data table. Defaults to `dataKey` as written when the chart has `pivot`, or a readable form of it otherwise. |
| `color` | `ChartColor` |  | A theme colour or any CSS colour. Defaults to the next categorical colour. |
| `format` | `ValueFormat` |  | How to write this series' values, when it differs from the chart's `format`. |
| `engineProps` | `EngineProps` |  | Props for the engine's own series component. Outside semver. |

`ChartLineProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `curve` | `'step' \| 'linear' \| 'smooth'` | `'linear'` |  |
| `variant` | `'solid' \| 'dashed'` | `'solid'` | `dashed` for a target, a forecast or last year. |
| `weight` | `'regular' \| 'bold' \| 'thin'` | `'regular'` |  |
| `dots` | `boolean` |  | Mark every point with a dot, not only the active one. |
| `dataKey` (required) | `string` |  | The key of this series' values in each row. |
| `label` | `string` |  | The series' name in the legend, the tooltip and the data table. Defaults to `dataKey` as written when the chart has `pivot`, or a readable form of it otherwise. |
| `color` | `ChartColor` |  | A theme colour or any CSS colour. Defaults to the next categorical colour. |
| `format` | `ValueFormat` |  | How to write this series' values, when it differs from the chart's `format`. |
| `engineProps` | `EngineProps` |  | Props for the engine's own series component. Outside semver. |

`ChartAreaProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `stack` | `string \| boolean` |  | Stack this area on others with the same stack id (`true` is one shared stack). |
| `curve` | `'step' \| 'linear' \| 'smooth'` | `'linear'` |  |
| `weight` | `'regular' \| 'bold' \| 'thin'` | `'regular'` | The weight of the area's top edge. |
| `dataKey` (required) | `string` |  | The key of this series' values in each row. |
| `label` | `string` |  | The series' name in the legend, the tooltip and the data table. Defaults to `dataKey` as written when the chart has `pivot`, or a readable form of it otherwise. |
| `color` | `ChartColor` |  | A theme colour or any CSS colour. Defaults to the next categorical colour. |
| `format` | `ValueFormat` |  | How to write this series' values, when it differs from the chart's `format`. |
| `engineProps` | `EngineProps` |  | Props for the engine's own series component. Outside semver. |

`ChartGridProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `values` | `boolean` | `true` | Lines across the value axis, the ones a reader follows to read a value. |
| `categories` | `boolean` | `false` | Lines at each category or point too. |
| `variant` | `'solid' \| 'dashed'` | `'solid'` |  |
| `engineProps` | `EngineProps` |  | Props for the engine's own grid component. Outside semver. |

`ChartXAxisProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `format` | `XFormat \| ValueFormat` |  | How to write the ticks: an x format on the category axis, a value format when the chart runs vertically (`layout="vertical"`) and x is the value axis. Defaults to the chart's. |
| `label` | `string` |  | A title for the axis, such as a unit. |
| `hide` | `boolean` |  | Leave the axis out but keep its scale (a sparse chart, a small multiple). |
| `engineProps` | `EngineProps` |  | Props for the engine's own axis component. Outside semver. |

`ChartYAxisProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `format` | `ValueFormat \| XFormat` |  | How to write the ticks: a value format, or an x format when the chart runs vertically and y is the category axis. Defaults to the chart's. |
| `label` | `string` |  | A title for the axis, such as a unit. |
| `hide` | `boolean` |  | Leave the axis out but keep its scale (a sparse chart, a small multiple). |
| `engineProps` | `EngineProps` |  | Props for the engine's own axis component. Outside semver. |

`ChartReferenceLineProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` |  | A value to mark across the plot: a target, a limit, an average. |
| `x` | `string \| number` |  | An x value to mark instead: the day a release went out. |
| `label` | `string` |  | Text beside the line. |
| `color` | `ChartColor` | `'neutral'` |  |
| `variant` | `'solid' \| 'dashed'` | `'dashed'` |  |
| `engineProps` | `EngineProps` |  | Props for the engine's own reference line component. Outside semver. |

`ChartTooltipPartProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `cursor` | `boolean` | `true` | Draw a guide at the active point: a line, or a band behind bars. |
| `engineProps` | `EngineProps` |  | Props for the engine's own tooltip component. Outside semver. |

`ChartLegendPartProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `toggle` | `boolean` | `true` | Let readers show and hide series from the legend. |
| `position` | `'top' \| 'bottom'` | `'top'` |  |

`ChartZoomProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ChartZoomRange \| null` |  | The zoomed range, when you control it. `null` shows everything. |
| `defaultValue` | `ChartZoomRange \| null` |  | The range to start zoomed to, when the chart controls it. |
| `onZoom` | `(range: ChartZoomRange \| null) => void` |  | Called with the range a reader selects, or `null` when they reset. |
| `resetLabel` | `string` | `'Show all'` |  |

`PivotOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `by` (required) | `string` |  | The key whose values become the series (`'region'`). Its values name them as written (`'iOS'` stays `'iOS'`); only wide keys are made readable. |
| `value` (required) | `string` |  | The key that holds each series' value (`'sales'`). |
| `limit` | `number \| false` | `7` | How many series to keep before grouping the rest as one "Other" series. They are ranked by their total. With 8 or fewer there's nothing to group. `false` keeps every series. |
| `other` | `string` | `'Other'` | The name of the grouped series, which the chart colours neutral. |

`ChartPoint`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` (required) | `number` |  | The row's position in the data the chart shows. |
| `x` (required) | `unknown` |  | The row's x value. |
| `row` (required) | `ChartRow` |  | The row itself. |

`ChartZoomRange`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `from` (required) | `unknown` |  |  |
| `to` (required) | `unknown` |  |  |
