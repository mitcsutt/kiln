import { render, screen, within } from '@testing-library/react'

import { expectNoAxeViolations } from '#test/a11y'

import { Bars } from './Bars'

const REGIONS = [
  { region: 'Harbour', online: 420, store: 310 },
  { region: 'Quay', online: 380, store: 120 },
  { region: 'Northgate', online: 290, store: 260 },
]

describe('Bars', () => {
  it('draws a bar series per numeric key', () => {
    const { container } = render(<Bars data={REGIONS} x="region" label="Orders by region" />)
    expect(container.querySelectorAll('.recharts-bar')).toHaveLength(2)
    expect(screen.getByRole('list', { name: 'Legend' })).toBeInTheDocument()
  })

  it('leaves the legend out for one series', () => {
    render(
      <Bars
        data={REGIONS}
        x="region"
        label="Online orders"
        series={[{ key: 'online', label: 'Online' }]}
      />,
    )
    expect(screen.queryByRole('list', { name: 'Legend' })).toBeNull()
  })

  it('takes long rows through pivot', () => {
    const long = REGIONS.flatMap(({ region, online, store }) => [
      { region, channel: 'Online', orders: online },
      { region, channel: 'In store', orders: store },
    ])
    render(
      <Bars
        data={long}
        x="region"
        label="Orders"
        pivot={{ by: 'channel', value: 'orders' }}
        locale="en-AU"
      />,
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows.map((r) => r.textContent)).toEqual([
      'RegionOnlineIn store',
      'Harbour420310',
      'Quay380120',
      'Northgate290260',
    ])
  })

  it('stacks to 100% with the value axis in percent and the values kept in the table', () => {
    render(<Bars data={REGIONS} x="region" label="Orders" stacked="percent" locale="en-AU" />)
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows[1]?.textContent).toBe('Harbour420310')
  })

  it('marks a target', () => {
    const { container } = render(
      <Bars data={REGIONS} x="region" label="Orders" target={{ value: 400, label: 'Target' }} />,
    )
    expect(container.querySelector('.recharts-reference-line')).not.toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Bars data={REGIONS} x="region" label="Orders by region" />)
    await expectNoAxeViolations(container)
  })
})
