<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# ChartFrame

> The frame every chart sits in: its reserved size, its states and its accessible text.

Source: https://kiln.mitchellsutton.com/docs/charts/building-blocks/chart-frame

Every chart in this package draws inside a `ChartFrame`, and you can draw your own in one too. The frame gives a chart what it needs to be readable by everyone and to render on the server:

- **A reserved size.** The frame takes its `height` (or fills its parent with `fill`) before anything is drawn, so a chart that draws in the browser never moves the page when it arrives.
- **An accessible name and summary.** The frame is a figure named by `label` and described by `summary`.
- **The data as a table.** Pass `table` and the frame renders it, visually hidden, for screen readers and for the server-rendered page.
- **Loading, empty and error states** in place of the plot, at the same size, with text a screen reader announces.

Pass the plot as children, or as a function of the measured plot size for drawing that needs pixels.

Draw your own chart in a frame: pass a function and it gets the plot's measured size, in the browser only. The frame gives it a name, a summary, the data as a hidden table and a reserved height.

```tsx
import { ChartFrame } from '@mitcsutt/kiln-charts'

export function Usage() {
  return (
    <ChartFrame
      label="Bookings by hour"
      summary="Bookings peak at noon and again at 6pm."
      table={{
        columns: ['Hour', 'Bookings'],
        rows: [
          ['9am', '12'],
          ['Noon', '40'],
          ['3pm', '18'],
          ['6pm', '33'],
        ],
      }}
      height={160}
    >
      {({ width, height }) => (
        <svg width={width} height={height} aria-hidden>
          {[12, 40, 18, 33].map((value, index) => (
            <rect
              key={value}
              x={(index * width) / 4 + 8}
              width={width / 4 - 16}
              y={height - (value / 40) * height}
              height={(value / 40) * height}
              fill="var(--color-cat-2)"
              stroke="var(--color-cat-2-stroke)"
            />
          ))}
        </svg>
      )}
    </ChartFrame>
  )
}
```

## States

Loading, empty and error states keep the frame's size and say what's happening.

```tsx
import { ChartFrame } from '@mitcsutt/kiln-charts'
import { Button, Grid } from '@mitcsutt/kiln-ui'

export function States() {
  return (
    <Grid columns={{ base: 1, md: 3 }} gap={5}>
      <ChartFrame label="Bookings by hour" status="loading" height={160} />
      <ChartFrame
        label="Cancellations by hour"
        status="empty"
        emptyMessage="No cancellations today"
        height={160}
      />
      <ChartFrame
        label="Walk-ins by hour"
        status="error"
        errorMessage="Walk-ins didn’t load"
        action={<Button size="sm">Try again</Button>}
        height={160}
      />
    </Grid>
  )
}
```

## API

`ChartFrameProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  | The chart's accessible name: what it shows, such as "Revenue by month". |
| `summary` | `string \| undefined` |  | A sentence or two on what the data says, read after the name. |
| `height` | `ChartHeight \| 'auto' \| undefined` | `240` | The frame's height in pixels, legend included, `fill` to fill a parent with a height, or `auto` for content that sizes itself and draws on the server (a list, a table of cells). |
| `status` | `'loading' \| 'error' \| 'empty' \| 'ready'` | `'ready'` |  |
| `emptyMessage` | `ReactNode` | `'No data to show'` |  |
| `errorMessage` | `ReactNode` | `"This chart couldn't load"` |  |
| `action` | `ReactNode` |  | One thing to do from the empty or error state, such as a retry button. |
| `table` | `ChartTable \| undefined` |  | The data as a table, for screen readers: one header per column, one row per point. |
| `legend` | `ReactNode` |  | A legend above the plot. |
| `footer` | `ReactNode` |  | Anything below the plot, such as a legend that goes under it. Visually hidden content here takes no space. |
| `children` | `ReactNode \| ((size: Size) => ReactNode)` |  | The plot. A function receives the plot's measured size and runs only in the browser, once the frame has been laid out: the server and the first render show the reserved frame. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`ChartTable`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` (required) | `string[]` |  |  |
| `rows` (required) | `string[][]` |  |  |
