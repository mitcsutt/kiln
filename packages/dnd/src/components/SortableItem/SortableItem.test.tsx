import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { arrayMove, Dnd, DragHandle, SortableItem } from '#index'
import { announcement } from '#test/dnd'

const legs = ['Harbour Square', 'Kelso Bay', 'Marram Point']

function Legs({ handle = false, disabled }: { handle?: boolean; disabled?: string }) {
  const [items, setItems] = useState(legs)
  return (
    <Dnd
      onDragEnd={({ item, target }) => {
        if (target?.kind !== 'list' || item.index === undefined) return
        const from = item.index
        setItems((current) => arrayMove(current, from, target.index))
      }}
    >
      <table>
        <tbody>
          {items.map((leg, index) => (
            <SortableItem
              key={leg}
              id={leg}
              index={index}
              label={leg}
              handle={handle}
              disabled={leg === disabled}
            >
              {({ ref, props, isDragging }) => (
                <tr ref={ref} {...props} data-testid={leg} data-lifted={isDragging || undefined}>
                  <td>{handle ? <DragHandle /> : null}</td>
                  <td>{leg}</td>
                </tr>
              )}
            </SortableItem>
          ))}
        </tbody>
      </table>
    </Dnd>
  )
}

const order = () => [...document.querySelectorAll('tbody tr')].map((row) => row.textContent)

describe('SortableItem', () => {
  it('makes your own element the drag control, with the entry styles and instructions', () => {
    render(<Legs />)
    const row = screen.getByTestId('Kelso Bay')
    expect(row.tagName).toBe('TR')
    expect(row).toHaveAttribute('tabindex', '0')
    expect(row).toHaveAttribute('data-orientation', 'vertical')
    expect(row.className).not.toBe('')
    expect(row).toHaveAccessibleDescription(/To pick up, press Space or Enter/)
  })

  it('moves by keyboard, draws the drop line on the row it lands before, and keeps focus', async () => {
    const user = userEvent.setup()
    render(<Legs />)
    const row = screen.getByTestId('Marram Point')
    row.focus()
    await user.keyboard(' ')
    expect(announcement()).toBe('Picked up Marram Point, position 3 of 3.')
    expect(row).toHaveAttribute('data-dragging', 'keyboard')
    expect(row).toHaveAttribute('data-lifted', 'true')
    await user.keyboard('{ArrowUp}')
    expect(screen.getByTestId('Kelso Bay')).toHaveAttribute('data-drop-edge', 'before')
    await user.keyboard(' ')
    expect(announcement()).toBe('Dropped Marram Point at position 2 of 3.')
    expect(order()).toEqual(['Harbour Square', 'Marram Point', 'Kelso Bay'])
    expect(screen.getByTestId('Marram Point')).toHaveFocus()
  })

  it('gives a DragHandle inside it the item, and leaves the row alone', async () => {
    const user = userEvent.setup()
    render(<Legs handle />)
    expect(screen.getByTestId('Kelso Bay')).not.toHaveAttribute('tabindex')
    expect(screen.getByTestId('Kelso Bay')).toHaveAttribute('data-handle', '')
    screen.getByRole('button', { name: 'Move Harbour Square' }).focus()
    await user.keyboard('{Enter}{ArrowDown}{ArrowDown}{Enter}')
    expect(order()).toEqual(['Kelso Bay', 'Marram Point', 'Harbour Square'])
    expect(screen.getByRole('button', { name: 'Move Harbour Square' })).toHaveFocus()
  })

  it('marks a disabled item that is its own handle', async () => {
    const user = userEvent.setup()
    render(<Legs disabled="Kelso Bay" />)
    const row = screen.getByTestId('Kelso Bay')
    expect(row).toHaveAttribute('aria-disabled', 'true')
    row.focus()
    await user.keyboard(' ')
    expect(row).not.toHaveAttribute('data-dragging')
  })
})
