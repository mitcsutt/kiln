<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# BarList

> A ranked list of named amounts, each with a bar: top pages, busiest stops, largest customers.

Source: https://kiln.mitchellsutton.com/docs/charts/presets/bar-list

`BarList` reads like a list because it is one: each item is its name and amount as text, with a bar below the name sized against the largest. It suits more categories than [Bars](./bars.md) does, long names, and narrow spaces such as a sidebar or a card. Items are ranked largest first unless you pass `sort="none"`, and `max` keeps only the top few.

It's plain HTML, so it renders completely on the server, and a screen reader reads it as an ordered list of names and amounts.

Long rows with `pivot`: each item's name and amount, ranked, with a bar against the largest.

```tsx
import { BarList } from '@mitcsutt/kiln-charts'

export function Usage() {
  return (
    <BarList
      data={[
        { page: '/pricing', views: 1840 },
        { page: '/docs/install', views: 3120 },
        { page: '/changelog', views: 960 },
        { page: '/docs/themes', views: 720 },
        { page: '/blog/release-notes-2-4', views: 410 },
      ]}
      pivot={{ by: 'page', value: 'views' }}
      label="Top pages by views, last 7 days"
    />
  )
}
```

## Top three

`max` keeps the top few; `color` takes any theme colour.

```tsx
import { BarList } from '@mitcsutt/kiln-charts'

export function TopFew() {
  return (
    <BarList
      data={[{ harbour: 128, quay: 342, riverside: 211, northgate: 97, docklands: 156 }]}
      labels={{
        harbour: 'Harbour Street',
        quay: 'Quay Road',
        riverside: 'Riverside',
        northgate: 'Northgate',
        docklands: 'Docklands',
      }}
      max={3}
      color="cat-3"
      label="Busiest stops, Saturday"
    />
  )
}
```

## API

`BarListProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `readonly ChartRow[]` |  | The items. Wide: one row whose numeric keys are the items (`{ harbour: 120, quay: 84 }`). Long: one row per item, with `pivot` naming the item and amount keys. |
| `pivot` | `PivotOptions` |  | Long rows: `by` names each item and `value` holds its amount. Every item is kept unless you set a `limit`. |
| `label` (required) | `string` |  | The list's accessible name, such as "Top pages by views". |
| `summary` | `string` |  | What the data says. Defaults to the count and the largest item. |
| `format` | `ValueFormat` | `'number'` | How to write amounts. |
| `locale` | `string` |  | The locale for numbers, passed to `Intl`. |
| `labels` | `Readonly<Record<string, string>>` |  | Names for the items, by key. Defaults to each `pivot` value as written, or a readable form of each wide key (`unitsSold` reads "Units sold"). |
| `color` | `ChartColor` | `'seq-5'` | The bars' colour. Bars measure amounts, so a ramp step suits. |
| `max` | `number` |  | Show only the largest this many. |
| `sort` | `'none' \| 'descending'` | `'descending'` | `descending` ranks the items; `none` keeps their order. |
| `status` | `'loading' \| 'error' \| 'empty' \| 'ready'` |  |  |
| `emptyMessage` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  |  |
| `action` | `ReactNode` |  |  |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`PivotOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `by` (required) | `string` |  | The key whose values become the series (`'region'`). Its values name them as written (`'iOS'` stays `'iOS'`); only wide keys are made readable. |
| `value` (required) | `string` |  | The key that holds each series' value (`'sales'`). |
| `limit` | `number \| false` | `7` | How many series to keep before grouping the rest as one "Other" series. They are ranked by their total. With 8 or fewer there's nothing to group. `false` keeps every series. |
| `other` | `string` | `'Other'` | The name of the grouped series, which the chart colours neutral. |
