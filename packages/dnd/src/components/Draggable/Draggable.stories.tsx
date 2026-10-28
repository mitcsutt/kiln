import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dnd, DragHandle, Draggable, DropZone, type DndItem } from '@mitcsutt/kiln-dnd'
import { Amount, Card, Grid, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { drag, expectAnnouncement, storyRoot } from '#stories/play'

const meta = {
  title: 'Drag and drop/Components/Draggable',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Invoice {
  id: string
  label: string
  client: string
  amount: number
}

const invoices: Invoice[] = [
  { id: 'inv-1042', label: 'Invoice 1042', client: 'Harbour Supplies', amount: 1840 },
  { id: 'inv-1043', label: 'Invoice 1043', client: 'Northgate Dental', amount: 625.5 },
]

function Inbox() {
  const [filed, setFiled] = useState<Record<string, string>>({})
  const file = (zone: string) => (item: DndItem) => {
    setFiled((current) => ({ ...current, [item.id]: zone }))
  }
  return (
    <Dnd>
      <Stack gap={5}>
        <Inline gap={4}>
          {invoices
            .filter((invoice) => !filed[invoice.id])
            .map((invoice) => (
              <Draggable key={invoice.id} id={invoice.id} label={invoice.label} data={invoice}>
                <Card padding={4}>
                  <Stack gap={1}>
                    <Text weight="strong">{invoice.label}</Text>
                    <Text size="sm" tone="muted">
                      {invoice.client}
                    </Text>
                    <Amount value={invoice.amount} currency="GBP" />
                  </Stack>
                </Card>
              </Draggable>
            ))}
        </Inline>
        <Grid columns={2} gap={4}>
          <DropZone id="paid" label="Paid" onDrop={file('Paid')}>
            <Text weight="strong">Paid</Text>
            <Text size="sm" tone="muted">
              {Object.entries(filed)
                .filter(([, zone]) => zone === 'Paid')
                .map(([id]) => id)
                .join(', ') || 'Nothing yet'}
            </Text>
          </DropZone>
          <DropZone id="disputed" label="Disputed" onDrop={file('Disputed')}>
            <Text weight="strong">Disputed</Text>
            <Text size="sm" tone="muted">
              {Object.entries(filed)
                .filter(([, zone]) => zone === 'Disputed')
                .map(([id]) => id)
                .join(', ') || 'Nothing yet'}
            </Text>
          </DropZone>
        </Grid>
      </Stack>
    </Dnd>
  )
}

/** Keyboard: pick up an invoice, step through the zones, drop it on one. */
export const Playground: Story = {
  render: () => <Inbox />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const invoice = canvas
      .getByText('Invoice 1042')
      .closest('[data-kiln-dnd-handle]') as HTMLElement
    invoice.focus()
    await userEvent.keyboard('{Enter}')
    await expectAnnouncement(root, 'Picked up Invoice 1042.')
    await userEvent.keyboard('{ArrowRight}')
    await expectAnnouncement(root, 'Invoice 1042 is over Paid.')
    await userEvent.keyboard('{ArrowRight}')
    await expectAnnouncement(root, 'Invoice 1042 is over Disputed.')
    await userEvent.keyboard('{Escape}')
    await expectAnnouncement(root, 'Move cancelled. Invoice 1042 is back where it started.')
    await expect(invoice).toHaveFocus()
    await userEvent.keyboard('{Enter}{ArrowRight}{Enter}')
    await expectAnnouncement(root, 'Dropped Invoice 1042 on Paid.')
    await expect(canvas.getByText('inv-1042')).toBeInTheDocument()
  },
}

/**
 * Wrap the items and the places they go in one `Dnd`. Each `DropZone` hears its drops in
 * `onDrop`, with the item's `id`, `label` and `data`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [archived, setArchived] = useState<string[]>([])
    return (
      <Dnd>
        <Stack gap={4}>
          <Inline gap={3}>
            {['Invoice 1042', 'Invoice 1043', 'Invoice 1044']
              .filter((invoice) => !archived.includes(invoice))
              .map((invoice) => (
                <Draggable key={invoice} id={invoice} label={invoice}>
                  <Card padding={4}>{invoice}</Card>
                </Draggable>
              ))}
          </Inline>
          <DropZone
            id="archive"
            label="Archive"
            onDrop={(item) => {
              setArchived((current) => [...current, item.label])
            }}
          >
            <Text>Archive ({archived.length})</Text>
          </DropZone>
        </Stack>
      </Dnd>
    )
  },
}

/**
 * When the item holds its own buttons, drag it by a `DragHandle`: set `handle` and put
 * the handle inside.
 */
export const WithHandle: Story = {
  tags: ['docs'],
  render: function WithHandle() {
    return (
      <Dnd>
        <Stack gap={4}>
          <Draggable id="contract" label="Contract for Northgate Dental" handle>
            <Card padding={4}>
              <Inline gap={3} align="center" justify="between">
                <Inline gap={3} align="center">
                  <DragHandle />
                  <Text>Contract for Northgate Dental</Text>
                </Inline>
                <Text size="sm" tone="muted">
                  Signed 3 March
                </Text>
              </Inline>
            </Card>
          </Draggable>
          <DropZone id="signed" label="Signed contracts">
            <Text>Signed contracts</Text>
          </DropZone>
        </Stack>
      </Dnd>
    )
  },
}

/** Pointer: drag an invoice onto a zone. The zone fills while the invoice is over it. */
export const PointerDrag: Story = {
  render: () => <Inbox />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const invoice = canvas.getByText('Invoice 1042')
    const zone = canvas.getByText('Disputed').parentElement as HTMLElement
    const drop = await drag(invoice, zone, { keepHolding: true })
    await waitFor(async () => {
      await expect(zone).toHaveAttribute('data-over')
    })
    await drop()
    await expectAnnouncement(root, 'Dropped Invoice 1042 on Disputed.')
    await waitFor(async () => {
      await expect(canvas.queryByText('Invoice 1042')).not.toBeInTheDocument()
    })
  },
}

/**
 * Touch: a quick swipe scrolls instead of dragging; a 250ms press first, then a drag,
 * picks the item up.
 */
export const TouchPress: Story = {
  render: () => <Inbox />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const invoice = canvas.getByText('Invoice 1043')
    const zone = canvas.getByText('Paid')

    // One step, so the swipe clears the 5px tolerance on its first move: a slow runner can let
    // 12 small frames run past the 250ms press and pick the item up.
    await drag(invoice, zone, { pointerType: 'touch', hold: 0, steps: 1 })
    await expect(canvas.getByText('Invoice 1043')).toBeInTheDocument()
    await waitFor(() => expect(root.querySelector('[data-dragging]')).toBeNull())

    await drag(canvas.getByText('Invoice 1043'), zone, { pointerType: 'touch', hold: 300 })
    await expectAnnouncement(root, 'Dropped Invoice 1043 on Paid.')
  },
}
