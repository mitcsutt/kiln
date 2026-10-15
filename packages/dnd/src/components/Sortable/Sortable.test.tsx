import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { DragHandle, Sortable } from '#index'
import { announcement, itemTexts } from '#test/dnd'

interface Task {
  id: string
  title: string
}

const tasks: Task[] = [
  { id: 'notes', title: 'Write release notes' },
  { id: 'qa', title: 'Run the QA pass' },
  { id: 'tag', title: 'Tag v2.4.0' },
  { id: 'post', title: 'Post the changelog' },
]

function Checklist(props: { onChange?: (items: Task[]) => void; handle?: boolean }) {
  const [items, setItems] = useState(tasks)
  return (
    <Sortable
      label="Release checklist"
      items={items}
      onChange={(next) => {
        setItems(next)
        props.onChange?.(next)
      }}
      getLabel={(task) => task.title}
      handle={props.handle}
    >
      {(task) => (
        <span>
          {props.handle ? <DragHandle /> : null}
          {task.title}
        </span>
      )}
    </Sortable>
  )
}

describe('Sortable', () => {
  it('renders a labelled list whose items point to the keyboard instructions', () => {
    render(<Checklist />)
    const list = screen.getByRole('list', { name: 'Release checklist' })
    expect(itemTexts(list)).toEqual(tasks.map((t) => t.title))
    const first = screen.getAllByRole('listitem')[0]
    expect(first).toHaveAttribute('tabindex', '0')
    expect(first).toHaveAccessibleDescription(/To pick up, press Space or Enter/)
  })

  it('picks up, moves, drops and keeps focus, announcing every step', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checklist onChange={onChange} />)
    const item = screen.getByText('Write release notes').closest('li') as HTMLElement
    item.focus()

    await user.keyboard(' ')
    expect(announcement()).toBe('Picked up Write release notes, position 1 of 4.')
    expect(item).toHaveAttribute('data-dragging', 'keyboard')

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(announcement()).toBe('Write release notes moved to position 3 of 4.')
    expect(onChange).not.toHaveBeenCalled()
    // The line sits between Tag and Post: drawn on the item the drop lands before.
    expect(screen.getByText('Post the changelog').closest('li')).toHaveAttribute(
      'data-drop-edge',
      'before',
    )
    expect(document.querySelectorAll('[data-drop-edge]')).toHaveLength(1)

    await user.keyboard('{Enter}')
    expect(announcement()).toBe('Dropped Write release notes at position 3 of 4.')
    expect(onChange).toHaveBeenCalledTimes(1)
    const list = screen.getByRole('list')
    expect(itemTexts(list)).toEqual([
      'Run the QA pass',
      'Tag v2.4.0',
      'Write release notes',
      'Post the changelog',
    ])
    expect(screen.getByText('Write release notes').closest('li')).toHaveFocus()
  })

  it('cancels with Escape and puts the item back', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checklist onChange={onChange} />)
    const item = screen.getByText('Run the QA pass').closest('li') as HTMLElement
    item.focus()
    await user.keyboard(' {ArrowUp}{Escape}')
    expect(announcement()).toBe('Move cancelled. Run the QA pass is back at position 2 of 4.')
    expect(onChange).not.toHaveBeenCalled()
    expect(item).toHaveFocus()
    expect(item).not.toHaveAttribute('data-dragging')
  })

  it('drags by a handle when `handle` is set', async () => {
    const user = userEvent.setup()
    render(<Checklist handle />)
    const handle = screen.getByRole('button', { name: 'Move Tag v2.4.0' })
    expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute('tabindex')
    handle.focus()
    await user.keyboard('{Enter}{ArrowUp}{ArrowUp}{ArrowUp}{Enter}')
    expect(itemTexts(screen.getByRole('list'))[0]).toBe('Tag v2.4.0')
    expect(screen.getByRole('button', { name: 'Move Tag v2.4.0' })).toHaveFocus()
  })
})
