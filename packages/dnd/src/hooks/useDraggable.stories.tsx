import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dnd, useDraggable, useDroppable } from '@mitcsutt/kiln-dnd'
import { Inline, Stack, Tag, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { expectAnnouncement, storyRoot } from '#stories/play'

const meta = {
  title: 'Drag and drop/Hooks/useDraggable',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Label({ name }: { name: string }) {
  const { ref, handleProps, isDragging } = useDraggable({ id: name, label: name })
  return (
    <span ref={ref} {...handleProps} data-dragging={isDragging ? '' : undefined}>
      <Tag>{name}</Tag>
    </span>
  )
}

function Tray({ onDrop }: { onDrop: (name: string) => void }) {
  const { ref, isOver } = useDroppable({
    id: 'urgent',
    label: 'Urgent',
    onDrop: (item) => {
      onDrop(item.label)
    },
  })
  return (
    <div ref={ref}>
      <Text tone={isOver ? 'accent' : 'muted'}>Drop here to mark it urgent</Text>
    </div>
  )
}

function Labels() {
  const [urgent, setUrgent] = useState<string[]>([])
  return (
    <Dnd>
      <Stack gap={4}>
        <Inline gap={2}>
          {['Billing', 'Refund', 'Login'].map((name) => (
            <Label key={name} name={name} />
          ))}
        </Inline>
        <Tray
          onDrop={(name) => {
            setUrgent((current) => [...current, name])
          }}
        />
        <Text size="sm">Urgent: {urgent.join(', ') || 'none'}</Text>
      </Stack>
    </Dnd>
  )
}

/** A hand-built draggable reaches a hand-built zone by the arrow keys. */
export const Playground: Story = {
  render: () => <Labels />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    ;(canvas.getByText('Refund').closest('[data-kiln-dnd-handle]') as HTMLElement).focus()
    await userEvent.keyboard('{Enter}{ArrowDown}{Enter}')
    await expectAnnouncement(root, 'Dropped Refund on Urgent.')
    await expect(canvas.getByText('Urgent: Refund')).toBeInTheDocument()
  },
}

/**
 * Put `ref` on the item and spread `handleProps` on it (or on its handle, with
 * `handle: true`). It reaches drop zones made with `useDroppable` or `DropZone`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return <Labels />
  },
}
