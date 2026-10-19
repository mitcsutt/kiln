import { act, fireEvent, render, screen, within } from '@testing-library/react'

import { expectNoAxeViolations } from '#test/a11y'
import { must } from '#test/must'

import { Heatmap } from './Heatmap'

const WEEK = [
  { day: 'Mon', '9am': 2, noon: 14, '5pm': 30 },
  { day: 'Tue', '9am': 4, noon: 18, '5pm': 26 },
  { day: 'Wed', '9am': 0, noon: null, '5pm': 21 },
]

describe('Heatmap', () => {
  it('is a grid named by its label, with row and column headers', () => {
    render(<Heatmap data={WEEK} x="day" label="Orders by hour" />)
    const grid = screen.getByRole('grid', { name: 'Orders by hour' })
    expect(
      within(grid)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['9am', 'noon', '5pm'])
    expect(
      within(grid)
        .getAllByRole('rowheader')
        .map((h) => h.textContent),
    ).toEqual(['Mon', 'Tue', 'Wed'])
  })

  it('colours cells along the sequential ramp, and empty cells as no data', () => {
    render(<Heatmap data={WEEK} x="day" label="Orders" />)
    const cells = screen.getAllByRole('gridcell')
    expect(cells[2]).toHaveStyle({ '--_fill': 'var(--color-seq-7)' })
    expect(cells[6]).toHaveStyle({ '--_fill': 'var(--color-seq-1)' })
    expect(cells[7]).toHaveTextContent('No data')
  })

  it('uses the diverging ramp around a midpoint', () => {
    render(
      <Heatmap
        data={[{ team: 'Design', w1: -10, w2: 0, w3: 10 }]}
        x="team"
        label="Change"
        scale="diverging"
      />,
    )
    const fills = screen
      .getAllByRole('gridcell')
      .map((cell) => cell.style.getPropertyValue('--_fill'))
    expect(fills).toEqual([
      'var(--color-div-neg-3)',
      'var(--color-div-mid)',
      'var(--color-div-pos-3)',
    ])
  })

  it('moves focus with the arrow keys and shows the value in a tooltip', () => {
    render(<Heatmap data={WEEK} x="day" label="Orders" locale="en-AU" />)
    const cells = screen.getAllByRole('gridcell')
    const first = must(cells[0], 'the first cell')
    expect(first).toHaveAttribute('tabindex', '0')
    expect(cells.filter((cell) => cell.tabIndex === 0)).toHaveLength(1)
    act(() => {
      first.focus()
    })
    expect(screen.getByText('Mon, 9am')).toBeInTheDocument()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(cells[1]).toHaveFocus()
    fireEvent.keyDown(must(cells[1]), { key: 'ArrowDown' })
    expect(cells[4]).toHaveFocus()
    expect(screen.getByText('Tue, noon')).toBeInTheDocument()
    fireEvent.keyDown(must(cells[4]), { key: 'End' })
    expect(cells[5]).toHaveFocus()
    fireEvent.keyDown(must(cells[5]), { key: 'Home' })
    expect(cells[3]).toHaveFocus()
  })

  it('keeps one tab stop when the data shrinks under the focused cell', () => {
    const { rerender } = render(<Heatmap data={WEEK} x="day" label="Orders" />)
    const last = must(screen.getAllByRole('gridcell')[8], 'the last cell')
    act(() => {
      last.focus()
    })
    rerender(<Heatmap data={WEEK.slice(0, 1)} x="day" label="Orders" />)
    const cells = screen.getAllByRole('gridcell')
    expect(cells.filter((cell) => cell.tabIndex === 0)).toEqual([cells[2]])
    fireEvent.keyDown(must(cells[2]), { key: 'ArrowLeft' })
    expect(cells[1]).toHaveFocus()
  })

  it('shows the columns given, in their order', () => {
    // Keys that look like whole numbers ('12') come before others ('09') in a JavaScript object.
    render(
      <Heatmap
        data={[{ day: 'Mon', '09': 1, '12': 2, '17': 3 }]}
        x="day"
        label="Orders"
        columns={['09', '12', '17']}
      />,
    )
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      '09',
      '12',
      '17',
    ])
  })

  it('takes long rows through pivot, keeping every column', () => {
    const long = Array.from({ length: 10 }, (_, hour) => ({
      day: 'Mon',
      hour: `h${String(hour)}`,
      n: hour,
    }))
    render(<Heatmap data={long} x="day" label="Orders" pivot={{ by: 'hour', value: 'n' }} />)
    expect(screen.getAllByRole('columnheader')).toHaveLength(10)
  })

  it('summarises the range and the peak', () => {
    render(<Heatmap data={WEEK} x="day" label="Orders" locale="en-AU" />)
    expect(screen.getByRole('figure')).toHaveAccessibleDescription(
      '3 rows by 3 columns. Values run from 0 to 30, highest at Mon, 5pm.',
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(<Heatmap data={WEEK} x="day" label="Orders by hour" />)
    await expectNoAxeViolations(container)
  })
})
