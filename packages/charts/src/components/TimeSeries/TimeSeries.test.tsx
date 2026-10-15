import { act, fireEvent, render, screen, within } from '@testing-library/react'

import { expectNoAxeViolations } from '#test/a11y'

import { TimeSeries } from './TimeSeries'

const DAYS = [
  { day: '2026-03-02', signups: 42, trials: 18 },
  { day: '2026-03-03', signups: 51, trials: 22 },
  { day: '2026-03-04', signups: 47, trials: 19 },
  { day: '2026-03-05', signups: 63, trials: 27 },
]

describe('TimeSeries', () => {
  it('plots every numeric key, with a legend when there is more than one', () => {
    const { container } = render(<TimeSeries data={DAYS} x="day" label="Sign-ups by day" />)
    expect(container.querySelectorAll('.recharts-line')).toHaveLength(2)
    const legend = screen.getByRole('list', { name: 'Legend' })
    expect(
      within(legend)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Signups', 'Trials'])
  })

  it('takes long rows through pivot', () => {
    const long = DAYS.flatMap(({ day, signups, trials }) => [
      { day, plan: 'Team', count: signups },
      { day, plan: 'Solo', count: trials },
    ])
    render(
      <TimeSeries
        data={long}
        x="day"
        label="Sign-ups by plan"
        pivot={{ by: 'plan', value: 'count' }}
      />,
    )
    const header = within(screen.getByRole('table')).getAllByRole('columnheader')
    expect(header.map((h) => h.textContent)).toEqual(['Day', 'Team', 'Solo'])
  })

  it('formats values and dates in the given locale', () => {
    render(
      <TimeSeries
        data={DAYS}
        x="day"
        label="Sign-ups"
        series={[{ key: 'signups', label: 'Sign-ups' }]}
        format={{ style: 'unit', unit: 'percent' }}
        locale="de-DE"
      />,
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows[1]?.textContent.replace(/\s/g, ' ')).toBe('2. März42 %')
  })

  it('draws areas, stacked or not', () => {
    const { container, rerender } = render(
      <TimeSeries data={DAYS} x="day" label="Sign-ups" variant="area" />,
    )
    expect(container.querySelectorAll('.recharts-area')).toHaveLength(2)
    rerender(<TimeSeries data={DAYS} x="day" label="Sign-ups" variant="stacked" />)
    expect(container.querySelectorAll('.recharts-area')).toHaveLength(2)
  })

  it('zooms from the keyboard and resets (dragging is covered by the browser story test)', () => {
    const onZoom = vi.fn()
    const { container } = render(
      <TimeSeries data={DAYS} x="day" label="Sign-ups by day" onZoom={onZoom} />,
    )
    const svg = container.querySelector<SVGSVGElement>('svg.recharts-surface')
    if (!svg) throw new Error('no chart')
    act(() => {
      svg.focus()
    })
    fireEvent.keyDown(svg, { key: 'ArrowRight', shiftKey: true })
    fireEvent.keyDown(svg, { key: 'Enter' })
    expect(onZoom).toHaveBeenCalledWith({ from: '2026-03-02', to: '2026-03-03' })
    fireEvent.click(screen.getByRole('button', { name: 'Show all' }))
    expect(onZoom).toHaveBeenLastCalledWith(null)
  })

  it('can turn zoom off', () => {
    const { container } = render(
      <TimeSeries data={DAYS} x="day" label="Sign-ups by day" zoomable={false} />,
    )
    expect(container.querySelector('desc')).not.toHaveTextContent('Shift')
  })

  it('has no axe violations', async () => {
    const { container } = render(<TimeSeries data={DAYS} x="day" label="Sign-ups by day" />)
    await expectNoAxeViolations(container)
  })
})
