import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { Board, type BoardMove } from '#index'
import { announcement, itemTexts } from '#test/dnd'

interface Card {
  id: string
  title: string
}

const columns = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
]

const start: Record<string, Card[]> = {
  todo: [
    { id: 'export', title: 'Fix the export button' },
    { id: 'invoice', title: 'Draft the invoice email' },
  ],
  doing: [{ id: 'search', title: 'Speed up search' }],
  done: [],
}

function ReleaseBoard({ onChange }: { onChange?: (move: BoardMove<Card>) => void }) {
  const [items, setItems] = useState(start)
  return (
    <Board
      label="Release board"
      columns={columns}
      items={items}
      onChange={(next, move) => {
        setItems(next)
        onChange?.(move)
      }}
      getLabel={(card) => card.title}
    >
      {(card) => card.title}
    </Board>
  )
}

const column = (name: string) => screen.getByRole('list', { name })

describe('Board', () => {
  it('renders each column with a heading, a count and its items', () => {
    render(<ReleaseBoard />)
    expect(screen.getByRole('group', { name: 'Release board' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'To do', level: 3 })).toBeInTheDocument()
    expect(itemTexts(column('To do'))).toEqual(['Fix the export button', 'Draft the invoice email'])
    expect(itemTexts(column('Done'))).toEqual([])
  })

  it('moves an item to the next column by keyboard and reports it once', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReleaseBoard onChange={onChange} />)
    const card = screen.getByText('Fix the export button').closest('li') as HTMLElement
    card.focus()

    await user.keyboard(' ')
    expect(announcement()).toBe('Picked up Fix the export button, position 1 of 2 in To do.')
    await user.keyboard('{ArrowRight}')
    expect(announcement()).toBe('Fix the export button moved to position 1 of 2 in Doing.')
    await user.keyboard('{ArrowDown}')
    expect(announcement()).toBe('Fix the export button moved to position 2 of 2 in Doing.')
    await user.keyboard(' ')
    expect(announcement()).toBe('Dropped Fix the export button at position 2 of 2 in Doing.')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { column: 'todo', index: 0 },
        to: { column: 'doing', index: 1 },
        input: 'keyboard',
      }),
    )
    expect(itemTexts(column('Doing'))).toEqual(['Speed up search', 'Fix the export button'])
    expect(itemTexts(column('To do'))).toEqual(['Draft the invoice email'])
    expect(screen.getByText('Fix the export button').closest('li')).toHaveFocus()
  })

  it('drops into an empty column', async () => {
    const user = userEvent.setup()
    render(<ReleaseBoard />)
    const card = screen.getByText('Speed up search').closest('li') as HTMLElement
    card.focus()
    await user.keyboard(' {ArrowRight}')
    expect(announcement()).toBe('Speed up search moved to position 1 of 1 in Done.')
    expect(column('Done')).toHaveAttribute('data-over')
    await user.keyboard(' ')
    expect(itemTexts(column('Done'))).toEqual(['Speed up search'])
    expect(itemTexts(column('Doing'))).toEqual([])
  })

  it('stays put at the edge of the board', async () => {
    const user = userEvent.setup()
    render(<ReleaseBoard />)
    const card = screen.getByText('Draft the invoice email').closest('li') as HTMLElement
    card.focus()
    await user.keyboard(' {ArrowLeft}')
    expect(announcement()).toBe('Draft the invoice email moved to position 2 of 2 in To do.')
    await user.keyboard('{Escape}')
    expect(announcement()).toBe(
      'Move cancelled. Draft the invoice email is back at position 2 of 2 in To do.',
    )
  })
})
