# @mitcsutt/kiln-charts

Charts for [`@mitcsutt/kiln-ui`](../ui), drawn in the theme's colours. Reach for a preset first (`TimeSeries`, `Bars`, `Share`, `BarList`, `Sparkline`, `Heatmap`), and compose a `Chart` from parts when no preset fits. Every chart has an accessible name, summary and data table, reads from the keyboard, renders on the server without moving the page, and restyles with the theme and colour mode through CSS alone.

## Install

```sh
pnpm add @mitcsutt/kiln-charts @mitcsutt/kiln-ui react-is
```

`@mitcsutt/kiln-ui`, React, React DOM and `react-is` (18.3 or 19, matching your React) are peer dependencies. Load the stylesheet once, after kiln-ui's:

```tsx
import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-charts/styles.css'
```

The charts that need axes and pointer tracking draw with [Recharts](https://recharts.org), a regular dependency you never import: no Recharts type or component is part of this package's API, so the engine can change without changing yours.

## Usage

```tsx
import { TimeSeries } from '@mitcsutt/kiln-charts'

export function Signups({ rows }: { rows: { day: string; signups: number; trials: number }[] }) {
  return (
    <TimeSeries
      data={rows}
      x="day"
      label="Sign-ups and trials by day"
      series={[
        { key: 'signups', label: 'Sign-ups' },
        { key: 'trials', label: 'Started a trial' },
      ]}
      height={260}
      locale="en-GB"
    />
  )
}
```

Compose your own from parts:

```tsx
import { Chart } from '@mitcsutt/kiln-charts'

;<Chart data={rows} x="month" xFormat="month" label="Revenue against target">
  <Chart.Grid />
  <Chart.XAxis />
  <Chart.YAxis format="compact" />
  <Chart.Bar dataKey="revenue" />
  <Chart.Line dataKey="target" variant="dashed" color="neutral" />
  <Chart.Tooltip />
  <Chart.Legend />
</Chart>
```

The [docs](https://kiln.mitchellsutton.com/docs/charts) cover choosing a chart, data and formatting, colour, accessibility and server rendering, and every component.

## Licence

MIT
