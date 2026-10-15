import { Chart, ChartColorScope } from '@mitcsutt/kiln-charts'
import { Box, Grid, Stack } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

const MONTHS = [
  { month: '2026-01-01', revenue: 18200, target: 20000 },
  { month: '2026-02-01', revenue: 21400, target: 20000 },
  { month: '2026-03-01', revenue: 19800, target: 21000 },
  { month: '2026-04-01', revenue: 24600, target: 21000 },
  { month: '2026-05-01', revenue: 26100, target: 22000 },
  { month: '2026-06-01', revenue: 23900, target: 22000 },
]

const meta = {
  title: 'Charts/Primitives/Chart',
  component: Chart,
  args: {
    data: MONTHS,
    x: 'month',
    label: 'Revenue against target, first half of 2026',
    xFormat: 'month',
    height: 260,
    format: { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 },
    locale: 'en-AU',
    children: (
      <>
        <Chart.Grid />
        <Chart.XAxis />
        <Chart.YAxis />
        <Chart.Bar dataKey="revenue" />
        <Chart.Line dataKey="target" variant="dashed" color="neutral" />
        <Chart.Tooltip />
        <Chart.Legend />
      </>
    ),
  },
} satisfies Meta<typeof Chart>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * Give the chart its rows, the key of `x` and an accessible `label`, then compose its parts:
 * series, chrome and the tooltip and legend. Kinds mix freely: here bars for revenue and a dashed
 * line for the target.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
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
  ),
}

/**
 * Areas stack with `stack`; a reference line marks a value with a label. Colours come from the
 * theme: `cat-*` for who a series is, the tones for status, `neutral` for context.
 */
export const StackedAreas: Story = {
  name: 'Stacked areas and a reference line',
  tags: ['docs'],
  render: () => (
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
  ),
}

/**
 * `layout="vertical"` runs the chart sideways, which suits long category names.
 * `stacking="percent"` stacks each row to 100%, so the axis reads shares while the tooltip and
 * table keep the values.
 */
export const Sideways: Story = {
  name: 'Sideways, stacked to 100%',
  tags: ['docs'],
  render: () => (
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
  ),
}

/**
 * Long rows (one row per month and region) become one series per region with `pivot`. Past
 * eight regions, the smallest group as a neutral "Other".
 */
export const Pivot: Story = {
  name: 'Long rows with pivot',
  tags: ['docs'],
  render: () => (
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
  ),
}

/**
 * In a `ChartColorScope`, a key keeps its colour in every chart: Harbour is the same colour in
 * both, though it's second in one and first in the other.
 */
export const ColourScope: Story = {
  name: 'Same colours across charts',
  tags: ['docs'],
  render: () => (
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
  ),
}

/**
 * The loading, empty and error states sit in the chart's reserved space, with text a screen
 * reader announces.
 */
export const States: Story = {
  tags: ['docs'],
  render: () => (
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
  ),
}

/** With `height="fill"`, the chart fills a parent that has a height, such as a grid cell. */
export const FillsItsCell: Story = {
  name: 'Filling a grid cell',
  render: () => (
    <Box data-testid="cell" style={{ blockSize: 300 }}>
      <Chart data={MONTHS} x="month" xFormat="month" label="Revenue" height="fill">
        <Chart.XAxis />
        <Chart.YAxis />
        <Chart.Line dataKey="revenue" />
      </Chart>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const cell = within(canvasElement).getByTestId('cell')
    await waitFor(() => {
      const svg = cell.querySelector('svg.recharts-surface')
      void expect(svg).not.toBeNull()
      void expect(cell.querySelector('figure')?.getBoundingClientRect().height).toBe(300)
    })
  },
}

/** Keyboard: focus the plot, move with the arrows, and the tooltip reads each point. */
export const Keyboard: Story = {
  render: (args) => <Chart {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    const svg = canvasElement.querySelector('svg.recharts-surface')
    // The legend's toggles come first in the tab order, then the plot.
    while (document.activeElement !== svg) await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    await expect(await canvas.findByText('Feb 2026', { selector: 'p' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Target' }))
    await expect(canvas.getByRole('button', { name: 'Target' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  },
}

/** Every theme colour token on one chart, for checking a theme. */
export const Tokens: Story = {
  name: 'Colour tokens',
  render: () => (
    <Stack gap={5}>
      <Chart
        data={[1, 2, 3, 4, 5, 6].map((n) => ({
          n: String(n),
          a: n,
          b: n + 1,
          c: n + 2,
          d: n + 3,
          e: n + 4,
          f: n + 5,
          g: n + 6,
          h: n + 7,
        }))}
        x="n"
        label="Categorical colours"
        height={220}
      >
        <Chart.YAxis />
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((key) => (
          <Chart.Line key={key} dataKey={key} />
        ))}
        <Chart.Legend />
      </Chart>
      <Chart
        data={[{ n: 'Status', positive: 4, caution: 3, critical: 2, info: 5, accent: 6 }]}
        x="n"
        label="Tones and accent"
        height={200}
      >
        <Chart.YAxis />
        <Chart.Bar dataKey="positive" color="positive" />
        <Chart.Bar dataKey="caution" color="caution" />
        <Chart.Bar dataKey="critical" color="critical" />
        <Chart.Bar dataKey="info" color="info" />
        <Chart.Bar dataKey="accent" color="accent" />
        <Chart.Legend />
      </Chart>
    </Stack>
  ),
}
