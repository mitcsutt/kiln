import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { defaultAnnouncements, DragHandle, Sortable } from '#index'
import { announcement } from '#test/dnd'

describe('announcements', () => {
  it('can be reworded or translated, a key at a time', async () => {
    const user = userEvent.setup()
    render(
      <Sortable
        label="Lista de tareas"
        defaultItems={[
          { id: 'a', title: 'Revisar' },
          { id: 'b', title: 'Publicar' },
        ]}
        getLabel={(task) => task.title}
        handle
        announcements={{
          handle: (item) => `Mover ${item}`,
          listLifted: (p) =>
            `${p.item} levantado, posición ${String(p.index + 1)} de ${String(p.count)}.`,
        }}
      >
        {() => <DragHandle />}
      </Sortable>,
    )
    const handle = screen.getByRole('button', { name: 'Mover Revisar' })
    handle.focus()
    await user.keyboard(' ')
    expect(announcement()).toBe('Revisar levantado, posición 1 de 2.')
    await user.keyboard('{ArrowDown}')
    // Keys not overridden stay English.
    expect(announcement()).toBe('Revisar moved to position 2 of 2.')
  })

  it('says the same words twice as a change', async () => {
    const user = userEvent.setup()
    render(
      <Sortable
        label="Steps"
        defaultItems={[
          { id: 'a', title: 'Draft' },
          { id: 'b', title: 'Send' },
        ]}
        getLabel={(task) => task.title}
      >
        {(task) => task.title}
      </Sortable>,
    )
    ;(screen.getByText('Draft').closest('li') as HTMLElement).focus()
    const region = document.querySelector('[data-kiln-dnd-announcer]') as HTMLElement
    await user.keyboard(' {ArrowUp}')
    const first = region.textContent
    await user.keyboard('{ArrowUp}')
    expect(region.textContent).not.toBe(first)
    expect(announcement()).toBe('Draft moved to position 1 of 2.')
  })

  it('has an English default for every key', () => {
    expect(defaultAnnouncements.gridResized({ item: 'Revenue', x: 0, y: 0, w: 1, h: 3 })).toBe(
      'Revenue is now 1 column wide and 3 rows tall.',
    )
  })
})
