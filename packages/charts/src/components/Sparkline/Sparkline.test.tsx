import { render, screen, within } from '@testing-library/react'

import { expectNoAxeViolations } from '#test/a11y'
import { must } from '#test/must'

import { Sparkline } from './Sparkline'

describe('Sparkline', () => {
  it('draws plain numbers as a line, marking the last point', () => {
    const { container } = render(<Sparkline data={[4, 8, 6, 12]} label="Orders, last 4 days" />)
    const line = must(container.querySelector('path'), 'the line')
    expect(line.getAttribute('d')).toBe('M0.00 96.00L33.33 50.00L66.67 73.00L100.00 4.00')
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(1)
  })

  it('breaks the line at a missing value', () => {
    const { container } = render(
      <Sparkline
        data={[
          { d: 'Mon', v: 1 },
          { d: 'Tue', v: null },
          { d: 'Wed', v: 3 },
          { d: 'Thu', v: 2 },
        ]}
        x="d"
        label="Visits"
      />,
    )
    expect(container.querySelector('path')?.getAttribute('d')).toMatch(/^M0\.00 96\.00M66\.67/)
  })

  it('draws areas and bars', () => {
    const { container, rerender } = render(
      <Sparkline data={[4, 8, 6]} label="Orders" variant="area" />,
    )
    expect(container.querySelectorAll('path')).toHaveLength(2)
    rerender(<Sparkline data={[4, -2, 6]} label="Net change" variant="bar" />)
    expect(container.querySelectorAll('rect')).toHaveLength(3)
  })

  it('is named, summarised and tabled from rows', () => {
    render(
      <Sparkline
        data={[
          { day: '2026-03-02', orders: 14 },
          { day: '2026-03-03', orders: 22 },
        ]}
        x="day"
        label="Orders this week"
        locale="en-GB"
      />,
    )
    expect(screen.getByRole('figure', { name: 'Orders this week' })).toHaveAccessibleDescription(
      '1 series over 2 points, from 2 Mar to 3 Mar. Orders ranges from 14 (2 Mar) to 22 (3 Mar).',
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows.map((row) => row.textContent)).toEqual(['DayOrders', '2 Mar14', '3 Mar22'])
  })

  it('numbers the points of rows without an x', () => {
    render(
      <Sparkline
        data={[
          { day: '2026-03-02', orders: 14 },
          { day: '2026-03-03', orders: 22 },
        ]}
        label="Orders this week"
      />,
    )
    expect(screen.getByRole('figure', { name: 'Orders this week' })).toHaveAccessibleDescription(
      '1 series over 2 points, from 1 to 2. Orders ranges from 14 (1) to 22 (2).',
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows.map((row) => row.textContent)).toEqual(['PointOrders', '114', '222'])
  })

  it('has no axe violations', async () => {
    const { container } = render(<Sparkline data={[4, 8, 6, 12]} label="Orders" />)
    await expectNoAxeViolations(container)
  })
})
