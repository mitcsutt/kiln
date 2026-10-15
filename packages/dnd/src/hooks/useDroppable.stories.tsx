import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dnd, Draggable, useDroppable } from '@mitcsutt/kiln-dnd'
import { Card, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { expectAnnouncement, storyRoot } from '#stories/play'

const meta = {
  title: 'Drag and drop/Hooks/useDroppable',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Bin({ onDrop }: { onDrop: (label: string) => void }) {
  const { ref, isOver, isActive } = useDroppable({
    id: 'bin',
    label: 'Bin',
    onDrop: (item) => {
      onDrop(item.label)
    },
  })
  return (
    <div ref={ref}>
      <Text tone={isOver ? 'critical' : isActive ? 'default' : 'muted'}>
        {isOver ? 'Let go to delete' : 'Bin'}
      </Text>
    </div>
  )
}

function Drafts() {
  const [drafts, setDrafts] = useState(['Spring newsletter', 'Price change notice'])
  return (
    <Dnd>
      <Stack gap={4}>
        <Inline gap={3}>
          {drafts.map((draft) => (
            <Draggable key={draft} id={draft} label={draft}>
              <Card padding={3}>{draft}</Card>
            </Draggable>
          ))}
        </Inline>
        <Bin
          onDrop={(label) => {
            setDrafts((current) => current.filter((draft) => draft !== label))
          }}
        />
      </Stack>
    </Dnd>
  )
}

/** `isActive` while a drag is on, `isOver` when the item would land here. */
export const Playground: Story = {
  render: () => <Drafts />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    ;(
      canvas.getByText('Spring newsletter').closest('[data-kiln-dnd-handle]') as HTMLElement
    ).focus()
    await userEvent.keyboard(' {ArrowDown}')
    await expect(canvas.getByText('Let go to delete')).toBeInTheDocument()
    await userEvent.keyboard(' ')
    await expectAnnouncement(root, 'Dropped Spring newsletter on Bin.')
    await expect(canvas.queryByText('Spring newsletter')).not.toBeInTheDocument()
  },
}

/** Your own drop target: `ref` on it, and `isOver` and `isActive` to draw its states. */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return <Drafts />
  },
}
