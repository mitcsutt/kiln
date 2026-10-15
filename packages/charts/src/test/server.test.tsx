// @vitest-environment node
import { renderToString } from 'react-dom/server'

import { BarList, Bars, Chart, Heatmap, Share, Sparkline, TimeSeries } from '#index'

/**
 * The chart engine draws only in the browser, so a Cartesian chart's server HTML is the frame at
 * its full height, the legend and the data table. The plain SVG and HTML charts render whole.
 */
const MONTHS = [
  { month: '2026-01-01', revenue: 18200, costs: 12400 },
  { month: '2026-02-01', revenue: 21400, costs: 13100 },
]

describe('server rendering', () => {
  it('renders a Cartesian chart as its sized frame, legend and table, with no plot', () => {
    const view = renderToString(
      <Chart
        data={MONTHS}
        x="month"
        label="Revenue by month"
        height={280}
        xFormat="month"
        locale="en-AU"
      >
        <Chart.XAxis />
        <Chart.Bar dataKey="revenue" />
        <Chart.Line dataKey="costs" />
        <Chart.Legend />
      </Chart>,
    )
    expect(view).toMatch(/^<figure aria-label="Revenue by month"/)
    expect(view).toContain('style="--_height:280px"')
    expect(view).toContain('<caption>Revenue by month</caption>')
    expect(view).toContain('<th scope="row">Jan 2026</th><td>18,200</td><td>12,400</td>')
    expect(view).toContain('aria-pressed="true"')
    expect(view).not.toContain('<svg')
  })

  it('renders the presets built on the engine the same way', () => {
    for (const page of [
      renderToString(<TimeSeries data={MONTHS} x="month" label="Revenue" />),
      renderToString(<Bars data={MONTHS} x="month" label="Revenue" />),
    ]) {
      expect(page).toContain('<table>')
      expect(page).not.toContain('<svg')
    }
  })

  it('renders Sparkline completely', () => {
    const view = renderToString(<Sparkline data={[3, 5, 4, 8]} label="Orders" />)
    expect(view).toContain('<svg')
    expect(view).toMatch(/<path d="M0\.00 /)
    expect(view).toContain('<table>')
  })

  it('renders Heatmap completely', () => {
    const view = renderToString(
      <Heatmap data={[{ day: 'Mon', am: 2, pm: 5 }]} x="day" label="Orders by half-day" />,
    )
    expect(view).toContain('role="grid"')
    expect(view).toContain('--_fill:var(--color-seq-7)')
  })

  it('renders Share and BarList completely', () => {
    expect(renderToString(<Share data={[{ a: 1, b: 3 }]} label="Split" />)).toContain('<circle')
    expect(renderToString(<BarList data={[{ harbour: 4, quay: 9 }]} label="Stops" />)).toContain(
      '<ol',
    )
  })
})
