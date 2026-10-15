<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Share

> Parts of a whole as a ring, with each part's amount and share in the legend beside it.

Source: https://kiln.mitchellsutton.com/docs/charts/presets/share

Use `Share` for a handful of parts that add up to something: visits by channel, spend by category, seats by plan. The legend names every part with its amount and percentage, so the ring is a picture of the shares and the numbers are always readable as text. Parts run largest first, clockwise from the top. Past eight parts, the smallest are grouped as a neutral "Other".

It's plain SVG and HTML, so it renders completely on the server. To compare parts across periods, use [Bars](./bars.md) with `stacked="percent"` instead.

One wide row: each numeric key is a part. The legend gives every share and amount as text.

```tsx
import { Share } from '@mitcsutt/kiln-charts'

export function Usage() {
  return (
    <Share
      data={[{ search: 5200, email: 1800, social: 2400, referral: 600 }]}
      labels={{ search: 'Search', email: 'Email', social: 'Social', referral: 'Referral' }}
      label="Visits by channel, April"
      totalLabel="visits"
    />
  )
}
```

## Many parts

Long rows with `pivot`. Past eight parts, the smallest group as a neutral "Other".

```tsx
import { Share } from '@mitcsutt/kiln-charts'

export function ManyParts() {
  return (
    <Share
      data={[
        { category: 'Rent', spend: 2400 },
        { category: 'Payroll', spend: 9800 },
        { category: 'Software', spend: 1240 },
        { category: 'Travel', spend: 860 },
        { category: 'Equipment', spend: 1520 },
        { category: 'Training', spend: 430 },
        { category: 'Insurance', spend: 610 },
        { category: 'Utilities', spend: 380 },
        { category: 'Catering', spend: 220 },
        { category: 'Postage', spend: 90 },
      ]}
      pivot={{ by: 'category', value: 'spend' }}
      format={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }}
      locale="en-GB"
      label="Spend by category, March"
      totalLabel="spent"
      height={240}
    />
  )
}
```

## API

`ShareProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `readonly ChartRow[]` |  | The parts. Wide: one row whose numeric keys are the parts (`{ search: 5200, email: 1800 }`). Long: one row per part, with `pivot` naming the part and amount keys. |
| `pivot` | `PivotOptions` |  | Long rows: `by` names each part and `value` holds its amount. Past 8 parts, the smallest group as "Other". |
| `label` (required) | `string` |  | The chart's accessible name, such as "Visits by channel". |
| `summary` | `string` |  | What the data says. Defaults to each part's share, largest first. |
| `height` | `ChartHeight` | `200` |  |
| `format` | `ValueFormat` | `'number'` | How to write amounts. |
| `locale` | `string` |  | The locale for numbers, passed to `Intl`. |
| `labels` | `Readonly<Record<string, string>>` |  | Names for the parts, by key. Defaults to a readable form of each key. |
| `colors` | `Readonly<Record<string, ChartColor>>` |  | Colours pinned to some parts, by key. |
| `totalLabel` | `string \| false` | `'total'` | A word for the total in the middle, such as "visits". `false` leaves the middle empty. |
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
