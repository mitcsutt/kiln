import { render, screen, within } from '@testing-library/react'

import { expectNoAxeViolations } from '#test/a11y'
import { TEST_HEIGHT, TEST_WIDTH } from '#test/env'

import { ChartFrame } from './ChartFrame'

const TABLE = {
  columns: ['Month', 'Orders'],
  rows: [
    ['Mar', '120'],
    ['Apr', '140'],
  ],
}

describe('ChartFrame', () => {
  it('is a figure with a name, a summary and the data as a hidden table', () => {
    render(
      <ChartFrame label="Orders by month" summary="Orders rose in April." table={TABLE}>
        <svg />
      </ChartFrame>,
    )
    const figure = screen.getByRole('figure', { name: 'Orders by month' })
    expect(figure).toHaveAccessibleDescription('Orders rose in April.')
    expect(within(figure).getAllByRole('row')).toHaveLength(3)
  })

  it('reserves its height and passes a render function the measured plot size', () => {
    const draw = vi.fn(() => null)
    render(
      <ChartFrame label="Orders" height={180}>
        {draw}
      </ChartFrame>,
    )
    expect(screen.getByRole('figure')).toHaveStyle({ '--_height': '180px' })
    expect(draw).toHaveBeenLastCalledWith({ width: TEST_WIDTH, height: TEST_HEIGHT })
  })

  it('shows the loading, empty and error states in place of the plot, with text', () => {
    const { rerender } = render(
      <ChartFrame label="Orders" status="loading" table={TABLE}>
        <p>plot</p>
      </ChartFrame>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading Orders')
    expect(screen.queryByText('plot')).toBeNull()
    expect(screen.queryByRole('table')).toBeNull()
    rerender(
      <ChartFrame label="Orders" status="empty" emptyMessage="No orders this month">
        <p>plot</p>
      </ChartFrame>,
    )
    expect(screen.getByText('No orders this month')).toBeInTheDocument()
    rerender(
      <ChartFrame label="Orders" status="error" action={<button type="button">Try again</button>}>
        <p>plot</p>
      </ChartFrame>,
    )
    expect(screen.getByText('This chart couldn’t load')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('has no axe violations in any state', async () => {
    for (const status of ['ready', 'loading', 'empty', 'error'] as const) {
      const { container, unmount } = render(
        <ChartFrame label="Orders" status={status} table={TABLE} />,
      )
      await expectNoAxeViolations(container)
      unmount()
    }
  })
})
