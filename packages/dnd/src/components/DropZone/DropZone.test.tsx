import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Dnd, DragHandle, Draggable, DropZone, type DndItem } from '#index'
import { announcement } from '#test/dnd'

function Inbox({
  onArchive,
  onFlag,
  onDragEnd,
}: {
  onArchive?: (item: DndItem) => void
  onFlag?: (item: DndItem) => void
  onDragEnd?: () => void
}) {
  return (
    <Dnd onDragEnd={onDragEnd}>
      <Draggable id="invoice-1042" label="Invoice 1042" data={{ amount: 1840 }}>
        Invoice 1042
      </Draggable>
      <Draggable id="receipt" label="Receipt from Harbour Supplies" handle>
        <DragHandle />
        Receipt
      </Draggable>
      <DropZone id="archive" label="Archive" onDrop={onArchive}>
        Archive
      </DropZone>
      <DropZone
        id="flagged"
        label="Flagged"
        onDrop={onFlag}
        accept={(item) => item.id !== 'receipt'}
      >
        Flagged
      </DropZone>
    </Dnd>
  )
}

describe('Draggable and DropZone', () => {
  it('moves through the zones by keyboard and drops onto one', async () => {
    const user = userEvent.setup()
    const onArchive = vi.fn()
    const onFlag = vi.fn()
    const onDragEnd = vi.fn()
    render(<Inbox onArchive={onArchive} onFlag={onFlag} onDragEnd={onDragEnd} />)
    const invoice = screen.getByText('Invoice 1042')
    invoice.focus()

    await user.keyboard('{Enter}')
    expect(announcement()).toBe('Picked up Invoice 1042.')
    expect(screen.getByText('Archive')).toHaveAttribute('data-active')

    await user.keyboard('{ArrowDown}')
    expect(announcement()).toBe('Invoice 1042 is over Archive.')
    expect(screen.getByText('Archive')).toHaveAttribute('data-over')
    await user.keyboard('{ArrowDown}')
    expect(announcement()).toBe('Invoice 1042 is over Flagged.')
    await user.keyboard('{ArrowDown}')
    expect(announcement()).toBe('Invoice 1042 is over Archive.')

    await user.keyboard('{Enter}')
    expect(announcement()).toBe('Dropped Invoice 1042 on Archive.')
    expect(onArchive).toHaveBeenCalledWith({
      id: 'invoice-1042',
      label: 'Invoice 1042',
      data: { amount: 1840 },
    })
    expect(onFlag).not.toHaveBeenCalled()
    expect(onDragEnd).toHaveBeenCalledTimes(1)
    expect(invoice).toHaveFocus()
  })

  it('only offers the zones that accept the item', async () => {
    const user = userEvent.setup()
    render(<Inbox />)
    screen.getByRole('button', { name: 'Move Receipt from Harbour Supplies' }).focus()
    await user.keyboard(' {ArrowDown}{ArrowDown}')
    expect(announcement()).toBe('Receipt from Harbour Supplies is over Archive.')
    expect(screen.getByText('Flagged')).not.toHaveAttribute('data-active')
  })

  it('says when nothing was under the item, and cancels when focus leaves', async () => {
    const user = userEvent.setup()
    const onDragEnd = vi.fn()
    render(<Inbox onDragEnd={onDragEnd} />)
    const invoice = screen.getByText('Invoice 1042')
    invoice.focus()
    await user.keyboard('{Enter}{Enter}')
    expect(announcement()).toBe('Invoice 1042 was not over a drop zone, so nothing moved.')

    await user.keyboard('{Enter}{ArrowDown}')
    await user.tab()
    expect(announcement()).toBe('Move cancelled. Invoice 1042 is back where it started.')
    expect(invoice).not.toHaveAttribute('data-dragging')
  })

  it('needs a Dnd around it', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    // React 18 rethrows render errors through a window error event, which jsdom reports.
    const quiet = (event: ErrorEvent) => {
      event.preventDefault()
    }
    window.addEventListener('error', quiet)
    onTestFinished(() => {
      window.removeEventListener('error', quiet)
    })
    expect(() =>
      render(
        <DropZone id="archive" label="Archive">
          Archive
        </DropZone>,
      ),
    ).toThrow('useDroppable must be rendered inside <Dnd>')
  })
})
