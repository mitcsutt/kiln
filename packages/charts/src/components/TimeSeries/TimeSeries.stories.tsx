import { TimeSeries } from '@mitcsutt/kiln-charts'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

const DAYS = [
  ['2026-03-02', 42, 18],
  ['2026-03-03', 51, 22],
  ['2026-03-04', 47, 19],
  ['2026-03-05', 63, 27],
  ['2026-03-06', 58, 31],
  ['2026-03-07', 34, 12],
  ['2026-03-08', 29, 10],
  ['2026-03-09', 61, 26],
  ['2026-03-10', 66, 29],
  ['2026-03-11', 72, 33],
  ['2026-03-12', 69, 30],
  ['2026-03-13', 75, 35],
].map(([day, signups, trials]) => ({ day, signups, trials }))

const meta = {
  title: 'Charts/Presets/TimeSeries',
  component: TimeSeries,
  args: {
    data: DAYS,
    x: 'day',
    label: 'Sign-ups and trials by day, March 2026',
    height: 260,
    locale: 'en-GB',
    onZoom: fn(),
  },
} satisfies Meta<typeof TimeSeries>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * Rows with a date and a value per series. Every numeric key is plotted unless you name the
 * `series`, and readers can drag across the plot to zoom.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
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
  ),
}

/** `variant="stacked"` stacks areas into a total; `format` and `locale` write every value. */
export const Stacked: Story = {
  name: 'Stacked areas',
  tags: ['docs'],
  render: () => (
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
  ),
}

/**
 * A dashed series for a comparison, such as last year. Long rows work too: `pivot` turns one row
 * per day and year into a series per year.
 */
export const Comparison: Story = {
  name: 'Against last year',
  tags: ['docs'],
  render: () => (
    <TimeSeries
      data={[
        { week: '2026-02-02', year: '2026', visits: 1820 },
        { week: '2026-02-09', year: '2026', visits: 2140 },
        { week: '2026-02-16', year: '2026', visits: 1990 },
        { week: '2026-02-23', year: '2026', visits: 2410 },
        { week: '2026-02-02', year: '2025', visits: 1610 },
        { week: '2026-02-09', year: '2025', visits: 1700 },
        { week: '2026-02-16', year: '2025', visits: 1880 },
        { week: '2026-02-23', year: '2025', visits: 1760 },
      ]}
      x="week"
      pivot={{ by: 'year', value: 'visits' }}
      series={[
        { key: '2026', label: 'This year' },
        { key: '2025', label: 'Last year', color: 'neutral', variant: 'dashed' },
      ]}
      label="Weekly visits, this year against last"
      height={240}
    />
  ),
}

/** Drag across the plot to zoom in; "Show all" resets. */
export const DragToZoom: Story = {
  name: 'Drag to zoom',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const wrapper = await waitFor(() => {
      const found = canvasElement.querySelector('.recharts-wrapper')
      if (!found) throw new Error('not drawn yet')
      return found
    })
    const box = wrapper.getBoundingClientRect()
    const y = box.top + box.height / 2
    const start = { clientX: box.left + box.width * 0.25, clientY: y }
    const end = { clientX: box.left + box.width * 0.75, clientY: y }
    const user = userEvent.setup()
    // The engine handles a move on the next animation frame, so wait for each move to land, as it
    // would between a real pointer's events: the hover finds the point under it, then the drag
    // draws the selection.
    await user.pointer({ coords: start, target: wrapper })
    await waitFor(() => {
      if (!wrapper.querySelector('.recharts-active-dot')) throw new Error('not hovered yet')
    })
    await user.pointer([
      { keys: '[MouseLeft>]', coords: start, target: wrapper },
      { coords: end, target: wrapper },
    ])
    await waitFor(() => {
      if (!wrapper.querySelector('.recharts-reference-area')) throw new Error('not selected yet')
    })
    await user.pointer({ keys: '[/MouseLeft]', coords: end, target: wrapper })
    await waitFor(() => expect(args.onZoom).toHaveBeenCalled())
    await userEvent.click(canvas.getByRole('button', { name: 'Show all' }))
    await expect(args.onZoom).toHaveBeenLastCalledWith(null)
  },
}

/** From the keyboard: Shift and the arrow keys select a range, Enter zooms in. */
export const KeyboardZoom: Story = {
  name: 'Keyboard zoom',
  play: async ({ canvasElement, args }) => {
    const svg = await waitFor(() => {
      const found = canvasElement.querySelector<SVGSVGElement>('svg.recharts-surface')
      if (!found) throw new Error('not drawn yet')
      return found
    })
    svg.focus()
    await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowRight}{ArrowRight}{/Shift}{Enter}')
    await waitFor(() =>
      expect(args.onZoom).toHaveBeenCalledWith({ from: '2026-03-02', to: '2026-03-05' }),
    )
  },
}
