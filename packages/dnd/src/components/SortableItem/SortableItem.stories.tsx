import type { Meta, StoryObj } from '@storybook/react-vite'
import { arrayMove, Dnd, DragHandle, SortableItem, useDroppable } from '@mitcsutt/kiln-dnd'
import { Table } from '@mitcsutt/kiln-ui'
import { useState, type ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { announcement, drag, expectAnnouncement, storyRoot } from '#stories/play'

const meta = {
  title: 'Drag and drop/Components/SortableItem',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Stop {
  id: string
  name: string
  window: string
}

const route: Stop[] = [
  { id: 'leeds', name: 'Leeds depot', window: '07:30' },
  { id: 'york', name: 'York, Fossgate', window: '09:15' },
  { id: 'hull', name: 'Hull marina', window: '11:00' },
  { id: 'beverley', name: 'Beverley market', window: '12:40' },
]

/** The table body is the list's container, so a row can land after the last one. */
function Stops({ children }: { children: ReactNode }) {
  const { ref } = useDroppable({ id: 'stops', label: 'Delivery stops', list: 'stops' })
  return <Table.Body ref={ref}>{children}</Table.Body>
}

function RouteTable() {
  const [stops, setStops] = useState(route)
  return (
    <Dnd
      onDragEnd={({ item, target }) => {
        if (target?.kind !== 'list' || item.index === undefined) return
        const from = item.index
        setStops((current) => arrayMove(current, from, target.index))
      }}
    >
      <Table aria-label="Delivery stops">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell width="min">Order</Table.HeaderCell>
            <Table.HeaderCell>Stop</Table.HeaderCell>
            <Table.HeaderCell align="end">Window</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Stops>
          {stops.map((stop, index) => (
            <SortableItem
              key={stop.id}
              id={stop.id}
              index={index}
              label={stop.name}
              list="stops"
              handle
            >
              {({ ref, props }) => (
                <Table.Row ref={ref} {...props}>
                  <Table.Cell>
                    <DragHandle />
                  </Table.Cell>
                  <Table.Cell>{stop.name}</Table.Cell>
                  <Table.Cell align="end">{stop.window}</Table.Cell>
                </Table.Row>
              )}
            </SortableItem>
          ))}
        </Stops>
      </Table>
    </Dnd>
  )
}

const stopNames = (root: HTMLElement) =>
  [...root.querySelectorAll('tbody tr')].map((row) => row.children[1]?.textContent)

/** Rows of a table, reordered by their handles: the same keys and words as `Sortable`. */
export const Playground: Story = {
  render: () => <RouteTable />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    canvas.getByRole('button', { name: 'Move Hull marina' }).focus()
    await userEvent.keyboard(' ')
    await expectAnnouncement(root, 'Picked up Hull marina, position 3 of 4.')
    await expect(canvas.getByText('Hull marina').closest('tr')).toHaveAttribute(
      'data-dragging',
      'keyboard',
    )
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await expectAnnouncement(root, 'Hull marina moved to position 1 of 4.')
    await expect(canvas.getByText('Leeds depot').closest('tr')).toHaveAttribute(
      'data-drop-edge',
      'before',
    )
    await userEvent.keyboard(' ')
    await expectAnnouncement(root, 'Dropped Hull marina at position 1 of 4.')
    await expect(stopNames(root)).toEqual([
      'Hull marina',
      'Leeds depot',
      'York, Fossgate',
      'Beverley market',
    ])
    await expect(canvas.getByRole('button', { name: 'Move Hull marina' })).toHaveFocus()
  },
}

/** Pointer: drag the first row's handle below the third row. The table changes once, on drop. */
export const PointerDrag: Story = {
  render: () => <RouteTable />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const handle = canvas.getByRole('button', { name: 'Move Leeds depot' })
    const third = canvas.getByText('Hull marina').getBoundingClientRect()
    // The engine loads after the story mounts, and a press before then picks nothing up, so
    // press again until the drag starts.
    let drop: () => Promise<void> = () => Promise.resolve()
    await waitFor(
      async () => {
        drop = await drag(
          handle,
          { x: third.left + 20, y: third.bottom - 2 },
          { keepHolding: true },
        )
        if (announcement(root) === 'Picked up Leeds depot, position 1 of 4.') return
        await drop()
        throw new Error('The drag did not start')
      },
      { timeout: 5000 },
    )
    await waitFor(async () => {
      await expect(canvas.getByText('Beverley market').closest('tr')).toHaveAttribute(
        'data-drop-edge',
        'before',
      )
    })
    await drop()
    await waitFor(async () => {
      await expect(stopNames(root)).toEqual([
        'York, Fossgate',
        'Hull marina',
        'Leeds depot',
        'Beverley market',
      ])
    })
  },
}

/**
 * Items that can't be list items, such as table rows: one `SortableItem` per row, with
 * `ref` and `props` on the row, inside a `Dnd` that applies the move with `arrayMove`.
 * `useDroppable({ list })` on the table body lets a row land after the last one.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return <RouteTable />
  },
}
