import { fireEvent, render, screen } from '@testing-library/react'

import { ChartTooltip } from '#components/ChartTooltip'
import { expectNoAxeViolations } from '#test/a11y'

import { ChartLegend } from './ChartLegend'

const ITEMS = [
  { key: 'online', label: 'Online', color: 'cat-1' as const },
  { key: 'store', label: 'In store', color: 'cat-2' as const, hidden: true },
]

describe('ChartLegend', () => {
  it('is a plain list of names with quiet swatches', () => {
    const { container } = render(<ChartLegend items={ITEMS} />)
    expect(screen.getByRole('list', { name: 'Legend' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
    for (const swatch of container.querySelectorAll('li > span > span:first-child')) {
      expect(swatch).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('toggles series with pressed buttons', () => {
    const onToggleSeries = vi.fn()
    render(<ChartLegend items={ITEMS} onToggleSeries={onToggleSeries} />)
    expect(screen.getByRole('button', { name: 'Online' })).toHaveAttribute('aria-pressed', 'true')
    const store = screen.getByRole('button', { name: 'In store' })
    expect(store).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(store)
    expect(onToggleSeries).toHaveBeenCalledWith('store')
  })

  it('has no axe violations', async () => {
    const { container } = render(<ChartLegend items={ITEMS} onToggleSeries={() => undefined} />)
    await expectNoAxeViolations(container)
  })
})

describe('ChartTooltip', () => {
  it('heads the point and lists each series with its value', () => {
    render(
      <ChartTooltip
        title="March 2026"
        items={[
          { label: 'Online', value: '420', color: 'cat-1' },
          { label: 'Target', value: '400', color: 'neutral', shape: 'dashed' },
        ]}
      />,
    )
    expect(screen.getByText('March 2026')).toBeInTheDocument()
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Online', 'Target'])
    expect(screen.getAllByRole('definition').map((d) => d.textContent)).toEqual(['420', '400'])
  })
})
