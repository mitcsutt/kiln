<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Bars

> Bars that compare amounts across categories: one group of bars per row, side by side or stacked.

Source: https://kiln.mitchellsutton.com/docs/charts/presets/bars

Use `Bars` to compare amounts across a handful of categories or periods: orders by region, hours by project, spend by month. Every numeric key in the rows is a series unless you name the `series`; long rows work with `pivot`. `layout="vertical"` lays the bars across, which suits long category names.

`stacked` stacks the series into one bar per row, and `stacked="percent"` shows each series' share of its row. For a ranked list of many categories, [BarList](./bar-list.md) reads better.

`Bars` is a short composition of [Chart](./chart.md) parts. When you need something it doesn't do, copy its source and change it.

One group of bars per row, a series per numeric key, named with `series`.

```tsx
import { Bars } from '@mitcsutt/kiln-charts'

export function Usage() {
  return (
    <Bars
      data={[
        { region: 'Harbour', online: 420, store: 310 },
        { region: 'Quay', online: 380, store: 120 },
        { region: 'Northgate', online: 290, store: 260 },
        { region: 'Riverside', online: 210, store: 190 },
      ]}
      x="region"
      series={[
        { key: 'online', label: 'Online' },
        { key: 'store', label: 'In store' },
      ]}
      label="Orders by region and channel, May"
      height={260}
    />
  )
}
```

## Stacked

`stacked` adds the series up into one bar per row; `target` marks a goal.

```tsx
import { Bars } from '@mitcsutt/kiln-charts'

export function Stacked() {
  return (
    <Bars
      data={[
        { month: 'Jan', billable: 128, internal: 34 },
        { month: 'Feb', billable: 141, internal: 22 },
        { month: 'Mar', billable: 119, internal: 41 },
        { month: 'Apr', billable: 150, internal: 18 },
      ]}
      x="month"
      stacked
      target={{ value: 160, label: 'Capacity' }}
      label="Hours logged by month"
      height={260}
    />
  )
}
```

## Shares, sideways

`layout="vertical"` lays the bars across, for long category names. `stacked="percent"` shows each part's share of its row.

```tsx
import { Bars } from '@mitcsutt/kiln-charts'

export function Shares() {
  return (
    <Bars
      data={[
        { plan: 'Studio, billed yearly', renewed: 182, lapsed: 21 },
        { plan: 'Studio, billed monthly', renewed: 240, lapsed: 66 },
        { plan: 'Team, billed yearly', renewed: 96, lapsed: 4 },
      ]}
      x="plan"
      layout="vertical"
      stacked="percent"
      series={[
        { key: 'renewed', color: 'positive' },
        { key: 'lapsed', color: 'neutral' },
      ]}
      label="Renewals by plan"
      height={220}
    />
  )
}
```

## API

`BarsProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `series` | `readonly SeriesConfig[]` |  | The series to plot. Defaults to every numeric key in the rows (or every series `pivot` makes), in order. |
| `stacked` | `'percent' \| boolean` | `false` | Stack the series into one bar per row: `true` adds them up, `percent` shows each one's share of the row. |
| `legend` | `boolean` | `true when there's more than one series` | Show the legend. |
| `target` | `{ value: number; label?: string }` |  | A line across the plot at a value, such as a target. |
| `label` (required) | `string` |  | The chart's accessible name: what it shows, such as "Revenue by month". |
| `x` (required) | `string` |  | The key of each row's x value: a category, or a date (a `Date` or an ISO 8601 string). |
| `format` | `ValueFormat` | `'number'` | How to write values. |
| `locale` | `string` |  | The locale for every number and date, passed to `Intl`. Defaults to the reader's. |
| `data` (required) | `readonly ChartRow[]` |  | The rows to plot. Wide rows have one key per series (`{ month: 'Mar', revenue: 1200 }`); long rows have one row per series and x, and need `pivot`. |
| `summary` | `string` |  | What the data says, read after the name. Defaults to a summary of each series' range. |
| `animate` | `boolean` | `true` | Animate marks in and between data. Never under reduced motion. |
| `status` | `'loading' \| 'error' \| 'empty' \| 'ready'` |  | Shows a loading, empty or error state in place of the chart. Empty data shows `empty`. |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | `vertical` runs the chart sideways: categories down the side and bars across. |
| `height` | `ChartHeight` | `240` | Pixels, legend included, or `fill` to fill a sized parent. |
| `emptyMessage` | `ReactNode` | `'No data to show'` |  |
| `action` | `ReactNode` |  | One thing to do from the empty or error state, such as a retry button. |
| `onPointClick` | `(point: ChartPoint) => void` |  | Called when a reader clicks a point, or presses Enter or Space on the active point when the chart has keyboard focus. |
| `pivot` | `PivotOptions` |  | Turn long rows into wide ones, one series per value of `by`. |
| `xFormat` | `XFormat` | `'date'` | How to write x values that are dates. |
| `xLabel` | `string` |  | The x column's header in the data table. Defaults to a readable form of `x`. |
| `timeZone` | `string` |  | The time zone dates print in, passed to `Intl`. Defaults to the reader's. |
| `errorMessage` | `ReactNode` | `"This chart couldn't load"` |  |
| `engineProps` | `EngineProps` |  | Props for the engine's own chart component. Outside semver. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`SeriesConfig`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `key` (required) | `string` |  | The key of this series' values in each row. |
| `label` | `string` |  | Its name in the legend, tooltip and table. Defaults to a readable form of `key`. |
| `color` | `ChartColor` |  | A theme colour or any CSS colour. Defaults to the next categorical colour. |
| `format` | `ValueFormat` |  | How to write this series' values, when it differs from the chart's `format`. |

`ChartPoint`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` (required) | `number` |  | The row's position in the data the chart shows. |
| `x` (required) | `unknown` |  | The row's x value. |
| `row` (required) | `ChartRow` |  | The row itself. |

`PivotOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `by` (required) | `string` |  | The key whose values become the series (`'region'`). |
| `value` (required) | `string` |  | The key that holds each series' value (`'sales'`). |
| `limit` | `number \| false` | `7` | How many series to keep before grouping the rest as one "Other" series. They are ranked by their total. With 8 or fewer there's nothing to group. `false` keeps every series. |
| `other` | `string` | `'Other'` | The name of the grouped series, which the chart colours neutral. |
