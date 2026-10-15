import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Dnd, DropZone, useSortable, type DragEndEvent, type DndItem } from '#index'
import { announcement } from '#test/dnd'

function Task({ id, title, index }: { id: string; title: string; index: number }) {
  const { ref, handleRef, handleProps } = useSortable({ id, label: title, index, handle: true })
  return (
    <li ref={ref}>
      <span ref={handleRef} {...handleProps}>
        {title}
      </span>
    </li>
  )
}

function Checklist({
  onDragEnd,
  onTrash,
}: {
  onDragEnd: (event: DragEndEvent) => void
  onTrash: (item: DndItem) => void
}) {
  return (
    <Dnd onDragEnd={onDragEnd}>
      <ul>
        <Task id="notes" title="Write release notes" index={0} />
        <Task id="qa" title="Run the QA pass" index={1} />
      </ul>
      <DropZone id="trash" label="Trash" data={{ bin: true }} onDrop={onTrash}>
        Trash
      </DropZone>
      <DropZone id="later" label="Later">
        Later
      </DropZone>
    </Dnd>
  )
}

describe('useSortable', () => {
  it('steps from the last list onto the drop zones by keyboard and drops on one', async () => {
    const user = userEvent.setup()
    const onDragEnd = vi.fn()
    const onTrash = vi.fn()
    render(<Checklist onDragEnd={onDragEnd} onTrash={onTrash} />)
    const handle = screen.getByText('Write release notes')
    handle.focus()

    await user.keyboard(' {ArrowRight}')
    expect(announcement()).toBe('Write release notes is over Trash.')
    expect(screen.getByText('Trash')).toHaveAttribute('data-over')
    await user.keyboard('{ArrowRight}')
    expect(announcement()).toBe('Write release notes is over Later.')
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(announcement()).toBe('Write release notes moved to position 1 of 2.')
    await user.keyboard('{ArrowRight}{Enter}')

    expect(announcement()).toBe('Dropped Write release notes on Trash.')
    const item = {
      id: 'notes',
      label: 'Write release notes',
      data: undefined,
      list: 'list',
      index: 0,
    }
    expect(onTrash).toHaveBeenCalledWith(item)
    expect(onDragEnd).toHaveBeenCalledTimes(1)
    expect(onDragEnd).toHaveBeenCalledWith({
      item,
      target: { kind: 'zone', id: 'trash', label: 'Trash', data: { bin: true } },
      input: 'keyboard',
    })
    expect(handle).toHaveFocus()
  })
})
