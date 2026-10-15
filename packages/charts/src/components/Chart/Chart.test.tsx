import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { Profiler, type ReactNode } from 'react'

import { ChartColorScope } from '#components/ChartColorScope'
import { expectNoAxeViolations } from '#test/a11y'
import { setReducedMotion } from '#test/env'
import { must } from '#test/must'

import { Chart, type ChartProps } from './Chart'

const MONTHS = [
  { month: '2026-01-01', revenue: 18200, costs: 12400 },
  { month: '2026-02-01', revenue: 21400, costs: 13100 },
  { month: '2026-03-01', revenue: 19800, costs: 12900 },
  { month: '2026-04-01', revenue: 24600, costs: 14200 },
]

function Revenue(props: Partial<ChartProps> & { children?: ReactNode }) {
  return (
    <Chart
      data={MONTHS}
      x="month"
      label="Revenue and costs by month"
      xFormat="month"
      locale="en-AU"
      {...props}
    >
      {props.children ?? (
        <>
          <Chart.Grid />
          <Chart.XAxis />
          <Chart.YAxis />
          <Chart.Bar dataKey="revenue" />
          <Chart.Line dataKey="costs" />
          <Chart.Tooltip />
          <Chart.Legend />
        </>
      )}
    </Chart>
  )
}

const surface = (container: HTMLElement) =>
  must(container.querySelector<SVGSVGElement>('svg.recharts-surface'), 'the chart surface')

describe('Chart', () => {
  it('is a figure named by its label and described by a summary of the data', () => {
    render(<Revenue />)
    const figure = screen.getByRole('figure', { name: 'Revenue and costs by month' })
    expect(figure).toHaveAccessibleDescription(
      '2 series over 4 points, from Jan 2026 to Apr 2026. Revenue ranges from 18,200 (Jan 2026) to 24,600 (Apr 2026). Costs ranges from 12,400 (Jan 2026) to 14,200 (Apr 2026).',
    )
  })

  it('takes a written summary instead', () => {
    render(<Revenue summary="Revenue grew every month but February." />)
    expect(screen.getByRole('figure')).toHaveAccessibleDescription(
      'Revenue grew every month but February.',
    )
  })

  it('holds every value in a hidden table that matches the data', () => {
    render(<Revenue />)
    const table = screen.getByRole('table', { name: 'Revenue and costs by month' })
    const rows = within(table).getAllByRole('row')
    expect(rows.map((row) => row.textContent)).toEqual([
      'MonthRevenueCosts',
      'Jan 202618,20012,400',
      'Feb 202621,40013,100',
      'Mar 202619,80012,900',
      'Apr 202624,60014,200',
    ])
    expect(within(table).getAllByRole('rowheader')).toHaveLength(4)
  })

  it('draws every series, mixing kinds, in theme colours', () => {
    const { container } = render(<Revenue />)
    expect(container.querySelectorAll('.recharts-bar')).toHaveLength(1)
    const line = must(container.querySelector('.recharts-line-curve'), 'the line')
    expect(line).toHaveAttribute('stroke', 'var(--color-cat-2-stroke)')
  })

  it('names the focusable surface and tells keyboard readers how to move', () => {
    const { container } = render(<Revenue />)
    const svg = surface(container)
    expect(svg).toHaveAttribute('tabindex', '0')
    expect(svg).toHaveAccessibleName('Revenue and costs by month')
    expect(svg.querySelector('desc')).toHaveTextContent(
      'Use the left and right arrow keys to move between points.',
    )
  })

  it('moves through points with the arrow keys and shows each in the tooltip', async () => {
    const { container } = render(<Revenue />)
    const svg = surface(container)
    act(() => {
      svg.focus()
    })
    const tooltip = await screen.findByText('Jan 2026', { selector: 'p' })
    expect(tooltip.closest('[role="status"]')).toHaveTextContent('Jan 2026Revenue18,200Costs12,400')
    fireEvent.keyDown(svg, { key: 'ArrowRight' })
    expect(await screen.findByText('Feb 2026', { selector: 'p' })).toBeInTheDocument()
    fireEvent.keyDown(svg, { key: 'ArrowRight' })
    expect(await screen.findByText('Mar 2026', { selector: 'p' })).toBeInTheDocument()
  })

  it('activates the point from the keyboard for onPointClick', async () => {
    const onPointClick = vi.fn()
    const { container } = render(<Revenue onPointClick={onPointClick} />)
    const svg = surface(container)
    act(() => {
      svg.focus()
    })
    fireEvent.keyDown(svg, { key: 'ArrowRight' })
    await screen.findByText('Feb 2026', { selector: 'p' })
    fireEvent.keyDown(svg, { key: ' ' })
    expect(onPointClick).toHaveBeenCalledWith({ index: 1, x: '2026-02-01', row: MONTHS[1] })
  })

  it('shows and hides series from the legend', () => {
    const { container } = render(<Revenue />)
    const legend = screen.getByRole('list', { name: 'Legend' })
    const costs = within(legend).getByRole('button', { name: 'Costs' })
    expect(costs).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('.recharts-line-curve')).not.toBeNull()
    fireEvent.click(costs)
    expect(costs).toHaveAttribute('aria-pressed', 'false')
    expect(container.querySelector('.recharts-line-curve')).toBeNull()
    fireEvent.click(costs)
    expect(container.querySelector('.recharts-line-curve')).not.toBeNull()
  })

  it('restyles with the theme and mode without rendering again', () => {
    let commits = 0
    const { container } = render(
      <Profiler
        id="chart"
        onRender={() => {
          commits += 1
        }}
      >
        <Revenue animate={false} />
      </Profiler>,
    )
    const before = commits
    const root = document.documentElement
    act(() => {
      root.dataset.theme = 'ledger'
      root.dataset.mode = 'dark'
    })
    act(() => {
      root.dataset.theme = 'riso'
    })
    expect(commits).toBe(before)
    // Every colour is a theme variable, so CSS alone restyles the marks.
    const painted = [...container.querySelectorAll('svg [fill], svg [stroke]')].flatMap((node) =>
      ['fill', 'stroke'].map((name) => node.getAttribute(name) ?? 'none'),
    )
    const colours = painted.filter(
      (value) => !['none', 'transparent', '#666', '#ccc', '#fff'].includes(value),
    )
    expect(colours.length).toBeGreaterThan(0)
    expect(colours.every((value) => value.startsWith('var(--'))).toBe(true)
    delete root.dataset.theme
    delete root.dataset.mode
  })

  it('pivots long rows into series, grouping past eight as a neutral Other', () => {
    const regions = [
      'Harbour',
      'Quay',
      'Northgate',
      'Riverside',
      'Old Town',
      'Docklands',
      'Hillcrest',
      'Westfield',
      'Marina',
      'Elm Park',
    ]
    const data = regions.map((region, i) => ({ month: 'Mar', region, sales: 100 - i }))
    const { container } = render(
      <Chart data={data} x="month" label="Sales by region" pivot={{ by: 'region', value: 'sales' }}>
        {[...regions.slice(0, 7), 'Other'].map((key) => (
          <Chart.Bar key={key} dataKey={key} />
        ))}
        <Chart.Legend />
      </Chart>,
    )
    const legend = screen.getByRole('list', { name: 'Legend' })
    expect(within(legend).getAllByRole('listitem')).toHaveLength(8)
    expect(within(legend).getByRole('button', { name: 'Other' })).toBeInTheDocument()
    const other = must(container.querySelectorAll('.recharts-bar')[7], 'the Other bars')
    expect(other.querySelector('path')?.getAttribute('fill') ?? 'var(--color-line-strong)').toBe(
      'var(--color-line-strong)',
    )
  })

  it('names a pivoted series as its value is written', () => {
    const data = [
      { month: 'Mar', platform: 'iOS', visits: 6 },
      { month: 'Mar', platform: 'macOS', visits: 4 },
    ]
    render(
      <Chart data={data} x="month" label="Visits" pivot={{ by: 'platform', value: 'visits' }}>
        <Chart.Bar dataKey="iOS" />
        <Chart.Bar dataKey="macOS" />
        <Chart.Legend />
      </Chart>,
    )
    const legend = screen.getByRole('list', { name: 'Legend' })
    expect(
      within(legend)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['iOS', 'macOS'])
  })

  it('gives a key the same colour in every chart of a scope, and lets pins win', () => {
    const { container } = render(
      <ChartColorScope colors={{ Quay: 'cat-5' }}>
        <Chart
          data={[
            { m: 'Mar', Harbour: 1, Quay: 2 },
            { m: 'Apr', Harbour: 2, Quay: 1 },
          ]}
          x="m"
          label="First"
        >
          <Chart.Line dataKey="Harbour" />
          <Chart.Line dataKey="Quay" />
        </Chart>
        <Chart
          data={[
            { m: 'Mar', Riverside: 3, Harbour: 1, Quay: 2 },
            { m: 'Apr', Riverside: 1, Harbour: 2, Quay: 3 },
          ]}
          x="m"
          label="Second"
        >
          <Chart.Line dataKey="Riverside" />
          <Chart.Line dataKey="Harbour" />
          <Chart.Line dataKey="Quay" color="critical" />
        </Chart>
      </ChartColorScope>,
    )
    const strokes = (chart: number) =>
      [
        ...(container.querySelectorAll('figure')[chart]?.querySelectorAll('.recharts-line-curve') ??
          []),
      ].map((line) => line.getAttribute('stroke'))
    expect(strokes(0)).toEqual(['var(--color-cat-1-stroke)', 'var(--color-cat-5-stroke)'])
    expect(strokes(1)).toEqual([
      'var(--color-cat-2-stroke)',
      'var(--color-cat-1-stroke)',
      'var(--tone-critical-text)',
    ])
  })

  it('in a scope, an automatic series skips a slot a pin in the same chart holds', () => {
    const { container } = render(
      <ChartColorScope>
        <Chart
          data={[
            { m: 'Mar', revenue: 1, orders: 2 },
            { m: 'Apr', revenue: 2, orders: 1 },
          ]}
          x="m"
          label="Pinned"
        >
          <Chart.Line dataKey="revenue" color="cat-1" />
          <Chart.Line dataKey="orders" />
        </Chart>
        <Chart
          data={[
            { m: 'Mar', orders: 2 },
            { m: 'Apr', orders: 1 },
          ]}
          x="m"
          label="Orders"
        >
          <Chart.Line dataKey="orders" />
        </Chart>
      </ChartColorScope>,
    )
    const strokes = (chart: number) =>
      [
        ...(container.querySelectorAll('figure')[chart]?.querySelectorAll('.recharts-line-curve') ??
          []),
      ].map((line) => line.getAttribute('stroke'))
    expect(strokes(0)).toEqual(['var(--color-cat-1-stroke)', 'var(--color-cat-2-stroke)'])
    expect(strokes(1)).toEqual(['var(--color-cat-1-stroke)'])
  })

  it("in a scope, the fallback for a clashing series skips the scope's own pins", () => {
    const { container } = render(
      <ChartColorScope colors={{ North: 'cat-2' }}>
        <Chart
          data={[
            { m: 'Mar', revenue: 1, orders: 2 },
            { m: 'Apr', revenue: 2, orders: 1 },
          ]}
          x="m"
          label="Pinned"
        >
          <Chart.Line dataKey="revenue" color="cat-1" />
          <Chart.Line dataKey="orders" />
        </Chart>
      </ChartColorScope>,
    )
    const strokes = [...container.querySelectorAll('.recharts-line-curve')].map((line) =>
      line.getAttribute('stroke'),
    )
    expect(strokes).toEqual(['var(--color-cat-1-stroke)', 'var(--color-cat-3-stroke)'])
  })

  it('without a scope, each chart colours its own series from the start', () => {
    const { container } = render(
      <>
        <Chart
          data={[
            { m: 'Mar', a: 1 },
            { m: 'Apr', a: 2 },
          ]}
          x="m"
          label="First"
        >
          <Chart.Line dataKey="a" />
        </Chart>
        <Chart
          data={[
            { m: 'Mar', b: 1 },
            { m: 'Apr', b: 2 },
          ]}
          x="m"
          label="Second"
        >
          <Chart.Line dataKey="b" />
        </Chart>
      </>,
    )
    const lines = [...container.querySelectorAll('.recharts-line-curve')]
    expect(lines.map((line) => line.getAttribute('stroke'))).toEqual([
      'var(--color-cat-1-stroke)',
      'var(--color-cat-1-stroke)',
    ])
  })

  it('reserves its height, or fills its parent with height fill', () => {
    const { rerender } = render(<Revenue height={320} />)
    expect(screen.getByRole('figure')).toHaveStyle({ '--_height': '320px' })
    rerender(<Revenue height="fill" />)
    expect(screen.getByRole('figure')).toHaveAttribute('data-height', 'fill')
    expect(document.querySelector('.recharts-wrapper')).toHaveStyle({
      width: '640px',
      height: '320px',
    })
  })

  it('animates marks, but not under reduced motion', () => {
    const { container, unmount } = render(<Revenue />)
    // Animating, the bars start empty and grow in.
    expect(container.querySelectorAll('.recharts-bar-rectangle path')).toHaveLength(0)
    unmount()
    setReducedMotion(true)
    const view = render(<Revenue />)
    expect(view.container.querySelectorAll('.recharts-bar-rectangle path')).toHaveLength(4)
  })

  it('shows the empty state for empty data, and loading and error states on request', () => {
    const { rerender } = render(<Revenue data={[]} />)
    expect(screen.getByText('No data to show')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
    rerender(<Revenue status="loading" />)
    expect(
      screen.getByText('Loading Revenue and costs by month').closest('[role="status"]'),
    ).not.toBeNull()
    expect(screen.getByRole('figure')).toHaveAttribute('aria-busy', 'true')
    rerender(<Revenue status="error" errorMessage="Revenue didn’t load. Try again shortly." />)
    expect(screen.getByText('Revenue didn’t load. Try again shortly.')).toBeInTheDocument()
  })

  it('zooms from the keyboard: Shift and the arrows select, Enter zooms, the button resets', async () => {
    const onZoom = vi.fn()
    const { container } = render(
      <Revenue>
        <Chart.XAxis />
        <Chart.Line dataKey="revenue" />
        <Chart.Tooltip />
        <Chart.Zoom onZoom={onZoom} />
      </Revenue>,
    )
    const svg = surface(container)
    expect(svg.querySelector('desc')).toHaveTextContent('Hold Shift with the arrow keys')
    act(() => {
      svg.focus()
    })
    await screen.findByText('Jan 2026', { selector: 'p' })
    fireEvent.keyDown(svg, { key: 'ArrowRight', shiftKey: true })
    fireEvent.keyDown(svg, { key: 'ArrowRight', shiftKey: true })
    expect(screen.getByText(/Selected Jan 2026 to Mar 2026/)).toBeInTheDocument()
    fireEvent.keyDown(svg, { key: 'Enter' })
    expect(onZoom).toHaveBeenLastCalledWith({ from: '2026-01-01', to: '2026-03-01' })
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: 'Show all' }))
    expect(onZoom).toHaveBeenLastCalledWith(null)
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(5)
  })

  it('leaves selection and zoom to the plot, not the legend', async () => {
    const onZoom = vi.fn()
    const onPointClick = vi.fn()
    const { container } = render(
      <Revenue onPointClick={onPointClick}>
        <Chart.XAxis />
        <Chart.Line dataKey="revenue" />
        <Chart.Line dataKey="costs" />
        <Chart.Tooltip />
        <Chart.Legend />
        <Chart.Zoom onZoom={onZoom} />
      </Revenue>,
    )
    const svg = surface(container)
    act(() => {
      svg.focus()
    })
    await screen.findByText('Jan 2026', { selector: 'p' })
    const costs = within(screen.getByRole('list', { name: 'Legend' })).getByRole('button', {
      name: 'Costs',
    })
    fireEvent.keyDown(costs, { key: 'ArrowRight', shiftKey: true })
    expect(screen.queryByText(/Selected/)).toBeNull()
    fireEvent.keyDown(costs, { key: 'Enter' })
    fireEvent.click(costs)
    expect(costs).toHaveAttribute('aria-pressed', 'false')
    expect(onZoom).not.toHaveBeenCalled()
    expect(onPointClick).not.toHaveBeenCalled()
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(5)
  })

  it('follows a controlled zoom', () => {
    render(
      <Revenue>
        <Chart.Line dataKey="revenue" />
        <Chart.Zoom value={{ from: '2026-02-01', to: '2026-03-01' }} />
      </Revenue>,
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows.map((row) => row.textContent)).toEqual([
      'MonthRevenue',
      'Feb 202621,400',
      'Mar 202619,800',
    ])
  })

  it('runs sideways with layout vertical', () => {
    const { container } = render(<Revenue layout="vertical" />)
    expect(screen.getByRole('figure')).toHaveAttribute('data-layout', 'vertical')
    expect(container.querySelector('.recharts-yAxis')).not.toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Revenue />)
    await expectNoAxeViolations(container)
  })

  it('needs its parts inside a Chart', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Chart.Grid />)).toThrow('Chart.Grid must be inside a <Chart>.')
  })
})
