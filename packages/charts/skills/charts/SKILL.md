---
name: charts
description: "Use when adding a chart to a React app with @mitcsutt/kiln-charts: choosing a preset (TimeSeries, Bars, Share, BarList, Sparkline, Heatmap) before composing one, wide or long rows with pivot, format, locale and timeZone, theme colours (cat, seq, div, tones) and ChartColorScope, drag-to-zoom, accessible labels and summaries, loading, empty and error states, height and fill, and server rendering."
metadata:
  purpose: Draw themed, accessible charts from a preset first, and compose your own from Chart parts only when no preset fits.
  type: core
  library: "@mitcsutt/kiln-charts"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/charts/index.mdx
  - mitcsutt/kiln:apps/docs/content/docs/charts/getting-started/choosing-a-chart.mdx
  - mitcsutt/kiln:apps/docs/content/docs/charts/getting-started/data-and-formatting.mdx
  - mitcsutt/kiln:apps/docs/content/docs/charts/getting-started/colour.mdx
  - mitcsutt/kiln:apps/docs/content/docs/charts/getting-started/accessibility-and-server-rendering.mdx
  - mitcsutt/kiln:packages/charts/src/components/TimeSeries/TimeSeries.tsx
  - mitcsutt/kiln:packages/charts/src/components/Bars/Bars.tsx
  - mitcsutt/kiln:packages/charts/src/components/Share/Share.tsx
  - mitcsutt/kiln:packages/charts/src/components/BarList/BarList.tsx
  - mitcsutt/kiln:packages/charts/src/components/Sparkline/Sparkline.tsx
  - mitcsutt/kiln:packages/charts/src/components/Heatmap/Heatmap.tsx
  - mitcsutt/kiln:packages/charts/src/components/Chart/Chart.tsx
  - mitcsutt/kiln:packages/charts/src/components/ChartFrame/ChartFrame.tsx
  - mitcsutt/kiln:packages/charts/src/components/ChartColorScope/ChartColorScope.tsx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Add a chart

Draw themed, accessible charts from a preset first, and compose your own from Chart parts only when no preset fits.

## Overview

Charts drawn in your theme's colours, readable by everyone and rendered on the server, from ready-made presets or parts you compose.

`@mitcsutt/kiln-charts` draws charts with kiln-ui's tokens: series take the theme's categorical colours, amounts take its ramps, and axes, labels and tooltips take its chart chrome. Switch the theme or the colour mode and every chart restyles through CSS, with no re-render.

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

### Install

```sh
pnpm add @mitcsutt/kiln-charts @mitcsutt/kiln-ui react-is
```

kiln-ui, React, React DOM and `react-is` (18.3 or 19, matching your React) are peer dependencies. Load the stylesheet once, after kiln-ui's:

```tsx
import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-charts/styles.css'
```

### Presets first

Most charts are one of a few kinds, and each has a preset that takes your rows and a few props:

- [TimeSeries](references/time-series.md): values over time, as lines or areas, with drag-to-zoom.
- [Bars](references/bars.md): amounts compared across categories, grouped or stacked.
- [Share](references/share.md): parts of a whole, as a ring with every share in its legend.
- [BarList](references/bar-list.md): a ranked list of named amounts.
- [Sparkline](references/sparkline.md): a word-sized trend beside a figure.
- [Heatmap](references/heatmap.md): a grid of cells coloured by amount.

When a preset doesn't do what you need, compose a [Chart](references/chart.md) from its parts. `TimeSeries` and `Bars` are short compositions of those parts, so their source is the place to start. For a meter, a progress ring or a stat tile, use kiln-ui's `Meter`, `Progress` and `Stat`.

### What every chart does for you

- **An accessible name and summary.** Every chart is a figure named by its `label`, and described by a summary written from the data unless you write your own.
- **The data as a table.** A visually hidden table holds every value, for screen readers and for the server-rendered page.
- **Keyboard reading.** Focus a chart and the arrow keys move between points, with the tooltip reading each one out.
- **Server rendering without a jump.** Charts reserve their height before they draw, so the page doesn't move when they arrive. `Sparkline`, `Heatmap`, `Share` and `BarList` render completely on the server.
- **Reduced motion.** Marks never animate when the reader asks for less motion.

### Where next

- [Choosing a chart](#): which preset fits your data.
- [Data and formatting](#): wide and long rows, `pivot`, and how values and dates are written.
- [Colour](references/colour.md): categorical colours for who, ramps for how much, and keeping colours consistent across a dashboard.
- [Accessibility and server rendering](references/accessibility-and-server-rendering.md): what readers get, and what you still decide.

## Choosing a chart

Which preset fits your data, and when to compose your own chart from parts.

Start from the question the chart answers, then pick the preset built for it. Every preset takes the same data shapes and formatting props, so switching between them is cheap.

| The question                                  | Use                                            |
| --------------------------------------------- | ---------------------------------------------- |
| How did it change over time?                  | [TimeSeries](references/time-series.md) |
| How do a few categories compare?              | [Bars](references/bars.md)              |
| How is a whole split into parts?              | [Share](references/share.md)            |
| Which items are largest, in order?            | [BarList](references/bar-list.md)       |
| Where is this one figure heading?             | [Sparkline](references/sparkline.md)    |
| Where are the patterns across two categories? | [Heatmap](references/heatmap.md)        |
| How full is it, or how far along?             | kiln-ui's `Meter` and `Progress`               |

### A few rules of thumb

- **Over time, use `TimeSeries`**, even with few points. Lines show change; bars for periods suit a handful of totals, such as revenue by quarter.
- **Parts of a whole over time are `Bars` with `stacked="percent"`**, not a row of rings: shares are easier to compare along one baseline.
- **More than about eight categories reads better as a `BarList`** than as bars: names stay legible and the ranking is the layout.
- **A single figure needs no chart.** Use kiln-ui's `Stat`, with a `Sparkline` beside it for the trend.

### When a preset isn't enough

Compose a [Chart](references/chart.md) from its parts: bars, lines and areas on one axis, reference lines, a tooltip, a legend and zoom.

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

`TimeSeries` and `Bars` are themselves short compositions of these parts. Copy their source as a starting point rather than reaching for the chart engine underneath: every part takes `engineProps` for the rare engine setting Kiln doesn't cover, but those are outside semver.

## Data and formatting

Wide and long rows, pivot, missing values, and how numbers and dates are written with format, locale and timeZone.

### Rows

Charts take an array of plain objects. **Wide rows** have one key per series, which is what the charts draw natively:

```ts
const rows = [
  { month: '2026-03-01', online: 420, store: 310 },
  { month: '2026-04-01', online: 455, store: 298 },
]
```

**Long rows** have one row per series and x, which is what most queries return. Pass them with `pivot`, naming the key that becomes the series (`by`) and the key that holds the value (`value`):

```ts
const rows = [
  { month: '2026-03-01', channel: 'Online', orders: 420 },
  { month: '2026-03-01', channel: 'In store', orders: 310 },
]
// <Bars data={rows} x="month" pivot={{ by: 'channel', value: 'orders' }} label="Orders" />
```

A chart can show eight categorical colours apart, so past eight series `pivot` keeps the seven largest by total and groups the rest as one neutral "Other". Change that with `limit` and `other`, or keep everything with `limit: false`. `Share` and `BarList` take long rows the same way, without an x; `Heatmap` keeps every column.

Series and parts are named for you. A key from wide rows is made readable, so `unitsSold` reads "Units sold". A value from `pivot`'s `by` key is data you wrote, so it's shown exactly as written: `iOS` stays `iOS`. To name either another way, give the series a `label`, or pass `labels` to `Share` and `BarList`.

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

### x values

`x` names the key of each row's x value: a category (`'Harbour'`), or a date (a `Date` or an ISO 8601 string such as `'2026-03-01'`). Points sit evenly along the axis, one per row, in the order of your rows. For a gap in time, include the row with its values missing: lines break there instead of joining across it.

### Writing values

`format` decides how values read in the tooltip, the axis, the legend and the data table:

- `number` (the default): grouped digits, up to two decimals.
- `integer`, `compact` (`12K`, `3.4M`) and `percent` (a fraction, so `0.125` reads `12.5%`).
- any `Intl.NumberFormatOptions`, such as `{ style: 'currency', currency: 'EUR' }`.
- a function from the value to its text.

A series can take its own `format`, and an axis can take a shorter one (``) while the tooltip keeps the full value.

### Writing dates

`xFormat` decides how dates read: `date` (the default, `3 Mar`), `month`, `year`, `weekday`, `time`, `datetime`, any `Intl.DateTimeFormatOptions`, or a function.

`locale` and `timeZone` go straight to `Intl`. Without them a chart uses the reader's, which can differ between your server and the reader's browser. Set both when a chart renders on the server, so the server's text and the browser's match. A date string with no offset (`'2026-03-01'` or `'2026-03-01T14:30'`) is a wall-clock time, not an instant: it prints as written, on the server and in every time zone, whatever `timeZone` says. `timeZone` applies only to instants: `Date` objects and strings with `Z` or an offset (`'2026-03-01T14:30Z'`, `'2026-03-01T14:30+10:00'`).

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

## References

Read a reference when its description matches the task:

- [Colour](references/colour.md): Categorical colours for who a series is, ramps for how much, tones for status, and the same colours across a dashboard.
- [Accessibility and server rendering](references/accessibility-and-server-rendering.md): What every chart gives screen reader and keyboard users, how charts render on the server, and what you still decide.
- [TimeSeries](references/time-series.md): Values over time: one line or area per series, on a shared time axis, with a tooltip, a legend and drag-to-zoom.
- [Bars](references/bars.md): Bars that compare amounts across categories: one group of bars per row, side by side or stacked.
- [Share](references/share.md): Parts of a whole as a ring, with each part's amount and share in the legend beside it.
- [BarList](references/bar-list.md): A ranked list of named amounts, each with a bar: top pages, busiest stops, largest customers.
- [Sparkline](references/sparkline.md): A word-sized line of values with no axes, for a trend beside a number.
- [Heatmap](references/heatmap.md): A grid of cells coloured by amount, for patterns across two categories: orders by hour and day, incidents by service and week.
- [Chart](references/chart.md): A chart you compose from parts: series of bars, lines and areas, mixed freely, on a shared x axis.
- [ChartFrame](references/chart-frame.md): The frame every chart sits in: its reserved size, its states and its accessible text.
- [ChartColorScope](references/chart-color-scope.md): Gives a series the same colour in every chart inside it.
