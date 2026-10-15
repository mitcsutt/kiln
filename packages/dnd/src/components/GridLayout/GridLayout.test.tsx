import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { DragHandle, GridLayout, type GridItem } from '#index'
import { announcement } from '#test/dnd'

const start: GridItem[] = [
  { i: 'revenue', x: 0, y: 0, w: 6, h: 2 },
  { i: 'orders', x: 6, y: 0, w: 6, h: 2 },
  { i: 'tickets', x: 0, y: 2, w: 4, h: 2 },
]

const labels: Record<string, string> = {
  revenue: 'Revenue',
  orders: 'Orders',
  tickets: 'Open tickets',
}

function Dashboard({ onChange }: { onChange?: (layout: GridItem[]) => void }) {
  const [layout, setLayout] = useState(start)
  return (
    <GridLayout
      label="Sales dashboard"
      layout={layout}
      onChange={(next) => {
        setLayout(next)
        onChange?.(next)
      }}
    >
      {start.map(({ i }) => (
        <GridLayout.Item key={i} id={i} label={labels[i] ?? i}>
          <div>
            <DragHandle />
            {labels[i]}
          </div>
        </GridLayout.Item>
      ))}
    </GridLayout>
  )
}

const position = (name: string) => {
  const style = (
    screen.getByRole('button', { name: `Move ${name}` }).parentElement?.parentElement as HTMLElement
  ).style
  return ['--_x', '--_y', '--_w', '--_h'].map((v) => Number(style.getPropertyValue(v)))
}

describe('GridLayout', () => {
  it('places each item from the layout and labels the grid', () => {
    render(<Dashboard />)
    expect(screen.getByRole('group', { name: 'Sales dashboard' })).toBeInTheDocument()
    expect(position('Revenue')).toEqual([0, 0, 6, 2])
    expect(position('Open tickets')).toEqual([0, 2, 4, 2])
    expect(screen.getByRole('button', { name: 'Move Revenue' })).toHaveAccessibleDescription(
      /Shift and the arrow keys to resize/,
    )
  })

  it('moves one cell per arrow and commits once, on drop', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Dashboard onChange={onChange} />)
    screen.getByRole('button', { name: 'Move Open tickets' }).focus()

    await user.keyboard(' ')
    expect(announcement()).toBe(
      'Picked up Open tickets, row 3, column 1, 4 columns wide and 2 rows tall.',
    )
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(announcement()).toBe('Open tickets moved to row 3, column 3.')
    expect(position('Open tickets')).toEqual([2, 2, 4, 2])
    expect(onChange).not.toHaveBeenCalled()

    await user.keyboard('{Enter}')
    expect(announcement()).toBe(
      'Dropped Open tickets at row 3, column 3, 4 columns wide and 2 rows tall.',
    )
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]?.[0]).toContainEqual({ i: 'tickets', x: 2, y: 2, w: 4, h: 2 })
    expect(screen.getByRole('button', { name: 'Move Open tickets' })).toHaveFocus()
  })

  it('moves past a neighbour in one key press, and the neighbour makes room', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    screen.getByRole('button', { name: 'Move Revenue' }).focus()
    await user.keyboard(' {ArrowDown}')
    expect(announcement()).toBe('Revenue moved to row 3, column 1.')
    expect(position('Open tickets')).toEqual([0, 0, 4, 2])
    await user.keyboard('{Enter}')
    expect(position('Revenue')).toEqual([0, 2, 6, 2])
  })

  it('resizes one cell per Shift and arrow', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Dashboard onChange={onChange} />)
    screen.getByRole('button', { name: 'Move Open tickets' }).focus()
    await user.keyboard(' {Shift>}{ArrowRight}{ArrowDown}{/Shift}')
    expect(announcement()).toBe('Open tickets is now 5 columns wide and 3 rows tall.')
    expect(position('Open tickets')).toEqual([0, 2, 5, 3])
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]?.[0]).toContainEqual({ i: 'tickets', x: 0, y: 2, w: 5, h: 3 })
  })

  it('never shrinks below one cell or grows past the columns', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    screen.getByRole('button', { name: 'Move Orders' }).focus()
    await user.keyboard(' {Shift>}{ArrowRight}{/Shift}')
    expect(position('Orders')).toEqual([6, 0, 6, 2])
    await user.keyboard('{Shift>}{ArrowUp}{ArrowUp}{ArrowUp}{/Shift}')
    expect(position('Orders')).toEqual([6, 0, 6, 1])
  })

  it('puts everything back on Escape', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Dashboard onChange={onChange} />)
    screen.getByRole('button', { name: 'Move Revenue' }).focus()
    await user.keyboard(' {ArrowDown}{Shift>}{ArrowLeft}{/Shift}{Escape}')
    expect(announcement()).toBe(
      'Move cancelled. Revenue is back at row 1, column 1, 6 columns wide and 2 rows tall.',
    )
    expect(position('Revenue')).toEqual([0, 0, 6, 2])
    expect(position('Open tickets')).toEqual([0, 2, 4, 2])
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Move Revenue' })).toHaveFocus()
  })

  it('keeps its own layout when uncontrolled', async () => {
    const user = userEvent.setup()
    render(
      <GridLayout label="Board" defaultLayout={[{ i: 'a', x: 0, y: 0, w: 2, h: 1 }]} columns={4}>
        <GridLayout.Item id="a" label="Notes">
          <DragHandle />
        </GridLayout.Item>
      </GridLayout>,
    )
    screen.getByRole('button', { name: 'Move Notes' }).focus()
    await user.keyboard(' {ArrowRight}{ArrowRight}{ArrowRight} ')
    expect(announcement()).toBe('Dropped Notes at row 1, column 3, 2 columns wide and 1 row tall.')
  })
})
