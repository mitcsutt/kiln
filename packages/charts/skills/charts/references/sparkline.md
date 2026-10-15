<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Sparkline

> A word-sized line of values with no axes, for a trend beside a number.

Source: https://kiln.mitchellsutton.com/docs/charts/presets/sparkline

Put a `Sparkline` next to a figure to show where it's heading: a [`Stat`](https://kiln.mitchellsutton.com/docs/ui/display/stat) tile, a table row, a card header. It fills its width at a small `height` and marks the last point. `area` fills below the line, and `bar` draws one bar per value.

It's plain SVG, so it renders completely on the server and costs no chart engine. It has an accessible name and summary, and its values as a visually hidden table.

Beside a figure, a sparkline shows where it's heading. Plain numbers are enough.

```tsx
import { Sparkline } from '@mitcsutt/kiln-charts'
import { Grid, Stat, Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Grid columns={{ base: 1, sm: 3 }} gap={6}>
      <Stack gap={2}>
        <Stat label="Orders" value="1,284" />
        <Sparkline data={[12, 18, 15, 22, 19, 27, 31, 28, 35]} label="Orders, last 9 days" />
      </Stack>
      <Stack gap={2}>
        <Stat label="Returns" value="38" />
        <Sparkline
          data={[6, 4, 5, 3, 4, 2, 3]}
          label="Returns, last 7 days"
          variant="area"
          color="cat-4"
        />
      </Stack>
      <Stack gap={2}>
        <Stat label="Net new seats" value="+14" />
        <Sparkline
          data={[3, -1, 4, 2, -2, 5, 3]}
          label="Net new seats by day"
          variant="bar"
          color="seq-5"
        />
      </Stack>
    </Grid>
  )
}
```

## Rows with dates

Rows with dates give the hidden table and the summary readable x values.

```tsx
import { Sparkline } from '@mitcsutt/kiln-charts'

export function WithDates() {
  return (
    <Sparkline
      data={[
        { day: '2026-03-02', latency: 182 },
        { day: '2026-03-03', latency: 176 },
        { day: '2026-03-04', latency: null },
        { day: '2026-03-05', latency: 214 },
        { day: '2026-03-06', latency: 190 },
      ]}
      x="day"
      label="Median response time, ms"
      height={48}
    />
  )
}
```

## API

`SparklineProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `readonly ChartRow[] \| readonly number[]` |  | The points: rows with a value (and an x for the data table), or plain numbers. |
| `x` | `string` |  | The key of each row's x value, for the data table and summary. |
| `dataKey` | `string` |  | The key of the value to plot. Defaults to the first numeric key. |
| `pivot` | `PivotOptions` |  | Long rows: plots the first series `pivot` makes. |
| `label` (required) | `string` |  | The sparkline's accessible name, such as "Orders, last 14 days". |
| `summary` | `string` |  | What the data says. Defaults to the range of values. |
| `variant` | `'area' \| 'line' \| 'bar'` | `'line'` |  |
| `color` | `ChartColor` | `'accent'` |  |
| `height` | `number` | `32` | Pixels. The sparkline fills its width. |
| `showLast` | `boolean` | `true` | Mark the last point, the one a reader looks for first. |
| `format` | `ValueFormat` | `'number'` | How to write values in the summary and table. |
| `xFormat` | `XFormat` | `'date'` | How to write x values that are dates. |
| `locale` | `string` |  |  |
| `timeZone` | `string` |  |  |
| `status` | `'loading' \| 'error' \| 'empty' \| 'ready'` |  |  |
| `emptyMessage` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  |  |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`PivotOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `by` (required) | `string` |  | The key whose values become the series (`'region'`). Its values name them as written (`'iOS'` stays `'iOS'`); only wide keys are made readable. |
| `value` (required) | `string` |  | The key that holds each series' value (`'sales'`). |
| `limit` | `number \| false` | `7` | How many series to keep before grouping the rest as one "Other" series. They are ranked by their total. With 8 or fewer there's nothing to group. `false` keeps every series. |
| `other` | `string` | `'Other'` | The name of the grouped series, which the chart colours neutral. |
