import type { Meta, StoryObj } from '@storybook/react-vite'
import { Board, DragHandle } from '@mitcsutt/kiln-dnd'
import { Avatar, Badge, Inline, Link, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { drag, expectAnnouncement, storyRoot } from '#stories/play'

interface Issue {
  id: string
  title: string
  owner: string
}

const columns = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'Doing' },
  { id: 'review', label: 'In review' },
  { id: 'done', label: 'Done' },
]

const issues: Record<string, Issue[]> = {
  todo: [
    { id: 'kb-212', title: 'Fix the CSV export for 10,000-row reports', owner: 'Priya Nair' },
    { id: 'kb-219', title: 'Draft the overdue-invoice email', owner: 'Ama Owusu' },
    { id: 'kb-224', title: 'Add Welsh to the language picker', owner: 'Tomás Ortega' },
  ],
  doing: [{ id: 'kb-198', title: 'Speed up search on the orders page', owner: 'Hana Kobayashi' }],
  review: [{ id: 'kb-187', title: 'Move receipts to the new storage bucket', owner: 'Priya Nair' }],
  done: [],
}

const meta = {
  title: 'Drag and drop/Components/Board',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const cardsIn = (root: HTMLElement, column: string) =>
  [...within(root).getByRole('list', { name: column }).querySelectorAll(':scope > li')].map((li) =>
    li.textContent.trim(),
  )

function Sprint() {
  return (
    <Board
      label="Sprint 14"
      columns={columns}
      defaultItems={issues}
      getLabel={(issue) => issue.title}
    >
      {(issue) => issue.title}
    </Board>
  )
}

/**
 * Keyboard: Up and Down within a column, Left and Right between columns, each step
 * announced with the column's name.
 */
export const Playground: Story = {
  render: () => <Sprint />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    canvas.getByText('Draft the overdue-invoice email').focus()
    await userEvent.keyboard(' ')
    await expectAnnouncement(
      root,
      'Picked up Draft the overdue-invoice email, position 2 of 3 in To do.',
    )
    await userEvent.keyboard('{ArrowRight}')
    await expectAnnouncement(
      root,
      'Draft the overdue-invoice email moved to position 2 of 2 in Doing.',
    )
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expectAnnouncement(
      root,
      'Draft the overdue-invoice email moved to position 1 of 1 in Done.',
    )
    await userEvent.keyboard('{Enter}')
    await expectAnnouncement(
      root,
      'Dropped Draft the overdue-invoice email at position 1 of 1 in Done.',
    )
    await expect(cardsIn(root, 'Done')).toEqual(['Draft the overdue-invoice email'])
    await expect(cardsIn(root, 'To do')).toHaveLength(2)
    await expect(canvas.getByText('Draft the overdue-invoice email')).toHaveFocus()
  },
}

/**
 * Columns in order, and each column's items in a map keyed by column id. Move cards with
 * the pointer, or focus one and use Space and the arrow keys.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Board
        label="Sprint 14"
        columns={[
          { id: 'todo', label: 'To do' },
          { id: 'doing', label: 'Doing' },
          { id: 'done', label: 'Done' },
        ]}
        defaultItems={{
          todo: [
            { id: 'kb-212', title: 'Fix the CSV export for 10,000-row reports' },
            { id: 'kb-219', title: 'Draft the overdue-invoice email' },
          ],
          doing: [{ id: 'kb-198', title: 'Speed up search on the orders page' }],
          done: [],
        }}
        getLabel={(issue) => issue.title}
      >
        {(issue) => issue.title}
      </Board>
    )
  },
}

/**
 * Cards with their own links drag by a `DragHandle`. `onChange` gets the whole new map
 * and the move, so you can save just the one card that changed.
 */
export const WithHandles: Story = {
  tags: ['docs'],
  render: function WithHandles() {
    const [items, setItems] = useState<
      Record<string, { id: string; title: string; owner: string }[]>
    >({
      todo: [
        { id: 'kb-212', title: 'Fix the CSV export', owner: 'Priya Nair' },
        { id: 'kb-224', title: 'Add Welsh to the language picker', owner: 'Tomás Ortega' },
      ],
      doing: [{ id: 'kb-198', title: 'Speed up order search', owner: 'Hana Kobayashi' }],
      done: [{ id: 'kb-187', title: 'Move receipts storage', owner: 'Ama Owusu' }],
    })
    const [last, setLast] = useState('Nothing moved yet.')
    return (
      <Stack gap={4}>
        <Board
          label="Sprint 14"
          columns={[
            { id: 'todo', label: 'To do' },
            { id: 'doing', label: 'Doing' },
            { id: 'done', label: 'Done' },
          ]}
          items={items}
          onChange={(next, move) => {
            setItems(next)
            setLast(`${move.item.id} moved from ${move.from.column} to ${move.to.column}.`)
          }}
          getLabel={(issue) => issue.title}
          handle
        >
          {(issue) => (
            <Stack gap={2}>
              <Inline gap={2} align="center" justify="between">
                <Link href={`#${issue.id}`}>{issue.id.toUpperCase()}</Link>
                <DragHandle />
              </Inline>
              <Text size="sm">{issue.title}</Text>
              <Inline gap={2} align="center">
                <Avatar name={issue.owner} size="sm" />
                <Text size="xs" tone="muted">
                  {issue.owner}
                </Text>
              </Inline>
            </Stack>
          )}
        </Board>
        <Text size="sm" tone="muted">
          {last}
        </Text>
      </Stack>
    )
  },
}

/** Pointer: drag a card into the next column. A line shows where it lands. */
export const PointerDrag: Story = {
  render: () => <Sprint />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const card = canvas.getByText('Fix the CSV export for 10,000-row reports')
    const target = canvas.getByText('Speed up search on the orders page')
    const rect = target.getBoundingClientRect()
    const drop = await drag(card, { x: rect.left + 24, y: rect.top + 4 }, { keepHolding: true })
    await waitFor(async () => {
      await expect(target).toHaveAttribute('data-drop-edge', 'before')
    })
    await drop()
    await waitFor(async () => {
      await expect(cardsIn(root, 'Doing')).toEqual([
        'Fix the CSV export for 10,000-row reports',
        'Speed up search on the orders page',
      ])
    })
    await expectAnnouncement(
      root,
      'Dropped Fix the CSV export for 10,000-row reports at position 1 of 2 in Doing.',
    )
  },
}

/** A busier board, for checking every theme: badges and avatars inside cards. */
export const Dense: Story = {
  render: () => (
    <Board
      label="Sprint 14"
      columns={columns}
      defaultItems={issues}
      getLabel={(i) => i.title}
      handle
    >
      {(issue) => (
        <Stack gap={2}>
          <Inline gap={2} align="center" justify="between">
            <Badge>{issue.id.toUpperCase()}</Badge>
            <DragHandle />
          </Inline>
          <Text size="sm">{issue.title}</Text>
          <Avatar name={issue.owner} size="sm" />
        </Stack>
      )}
    </Board>
  ),
}
