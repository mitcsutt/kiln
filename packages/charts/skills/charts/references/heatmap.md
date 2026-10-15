<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Heatmap

> A grid of cells coloured by amount, for patterns across two categories: orders by hour and day, incidents by service and week.

Source: https://kiln.mitchellsutton.com/docs/charts/presets/heatmap

Each row of data is a row of cells, and each column key a column. Colours come from the theme's ramps, never the categorical colours: `sequential` for amounts, where more data sits further from the page, and `diverging` for values either side of a `midpoint`, where the middle is neutral. A key under the cells shows the scale.

The heatmap is an HTML table, so it renders completely on the server and a screen reader reads it as one, with row and column headers. Hover a cell, or focus the grid and move with the arrow keys, to see its value in a tooltip. Home and End go to the ends of a row.

Long rows with `pivot`, one per day and hour. Hours look like whole numbers, so `columns` sets their order.

```tsx
import { Heatmap } from '@mitcsutt/kiln-charts'

export function Usage() {
  return (
    <Heatmap
      data={[
        { day: 'Mon', hour: '09', orders: 4 },
        { day: 'Mon', hour: '12', orders: 30 },
        { day: 'Mon', hour: '17', orders: 18 },
        { day: 'Tue', hour: '09', orders: 6 },
        { day: 'Tue', hour: '12', orders: 28 },
        { day: 'Tue', hour: '17', orders: 22 },
        { day: 'Wed', hour: '09', orders: 5 },
        { day: 'Wed', hour: '12', orders: 33 },
        { day: 'Wed', hour: '17', orders: 27 },
      ]}
      x="day"
      pivot={{ by: 'hour', value: 'orders' }}
      columns={['09', '12', '17']}
      columnLabels={{ '09': '9am', '12': 'Noon', '17': '5pm' }}
      label="Orders by day and hour"
    />
  )
}
```

## Change either side of zero

`scale="diverging"` colours either side of `midpoint`, here change against last week.

```tsx
import { Heatmap } from '@mitcsutt/kiln-charts'

export function Diverging() {
  return (
    <Heatmap
      data={[
        { team: 'Platform', w14: 4, w15: -2, w16: 7, w17: 1 },
        { team: 'Payments', w14: -6, w15: -3, w16: 0, w17: 5 },
        { team: 'Mobile', w14: 2, w15: 8, w16: -4, w17: -7 },
      ]}
      x="team"
      columnLabels={{ w14: 'Wk 14', w15: 'Wk 15', w16: 'Wk 16', w17: 'Wk 17' }}
      scale="diverging"
      format={{ signDisplay: 'exceptZero' }}
      label="Change in open issues against the week before"
    />
  )
}
```

## API

`HeatmapProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `readonly ChartRow[]` |  | The rows of cells. Wide: one row per heatmap row, with its label under `x` and a key per column (`{ day: 'Mon', '09': 4, '10': 12 }`). Long: one row per cell, with `pivot`. |
| `x` (required) | `string` |  | The key of each row's label: a category, or a date. |
| `pivot` | `PivotOptions` |  | Long rows: `by` names each cell's column and `value` holds its amount. Every column is kept. |
| `columns` | `readonly string[]` |  | The columns to show, in order. Defaults to every numeric key in the order JavaScript lists them, which puts keys that look like whole numbers (`'12'`) first: pass `columns` for hours. |
| `columnLabels` | `Readonly<Record<string, string>>` |  | Names for the columns, by key. Defaults to each key as written. |
| `label` (required) | `string` |  | The heatmap's accessible name, such as "Orders by hour and day". |
| `summary` | `string` |  | What the data says. Defaults to the range of values and where the highest is. |
| `scale` | `'sequential' \| 'diverging'` | `'sequential'` | `sequential` for amounts (more is darker in light mode); `diverging` for values either side of `midpoint`, such as change against last week. |
| `domain` | `readonly [number, number]` |  | The values the colour runs between. Defaults to the data's range. |
| `midpoint` | `number` | `0` | The neutral middle of a diverging scale. |
| `legend` | `boolean` | `true` | Show the colour key under the cells. |
| `format` | `ValueFormat` | `'number'` | How to write values. |
| `xFormat` | `XFormat` | `'date'` | How to write row labels that are dates. |
| `locale` | `string` |  |  |
| `timeZone` | `string` |  |  |
| `status` | `'loading' \| 'error' \| 'empty' \| 'ready'` |  |  |
| `emptyMessage` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  |  |
| `action` | `ReactNode` |  |  |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`PivotOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `by` (required) | `string` |  | The key whose values become the series (`'region'`). |
| `value` (required) | `string` |  | The key that holds each series' value (`'sales'`). |
| `limit` | `number \| false` | `7` | How many series to keep before grouping the rest as one "Other" series. They are ranked by their total. With 8 or fewer there's nothing to group. `false` keeps every series. |
| `other` | `string` | `'Other'` | The name of the grouped series, which the chart colours neutral. |
