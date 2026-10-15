import type { Meta, StoryObj } from '@storybook/react-vite'
import { DragHandle, Sortable } from '@mitcsutt/kiln-dnd'
import { Inline, Text } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'

import { expectAnnouncement, storyRoot } from '#stories/play'

const meta = {
  title: 'Drag and drop/Components/DragHandle',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const stops = [
  { id: 'leeds', name: 'Leeds depot' },
  { id: 'york', name: 'York, Fossgate' },
  { id: 'hull', name: 'Hull marina' },
]

function Route() {
  return (
    <Sortable label="Delivery route" defaultItems={stops} getLabel={(stop) => stop.name} handle>
      {(stop) => (
        <Inline gap={3} align="center">
          <DragHandle />
          <Text>{stop.name}</Text>
        </Inline>
      )}
    </Sortable>
  )
}

/** The handle is named after its item and points to the keyboard instructions. */
export const Playground: Story = {
  render: () => <Route />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const handle = canvas.getByRole('button', { name: 'Move Hull marina' })
    await expect(handle).toHaveAccessibleDescription(/To pick up, press Space or Enter/)
    handle.focus()
    await userEvent.keyboard('{Enter}{ArrowUp}{ArrowUp}{Enter}')
    await expectAnnouncement(root, 'Dropped Hull marina at position 1 of 3.')
    await expect(canvas.getByRole('button', { name: 'Move Hull marina' })).toHaveFocus()
  },
}

/**
 * Put a `DragHandle` in each item of a `Sortable` or `Board` with `handle`, in a
 * `Draggable` with `handle`, or in a `GridLayout.Item`. It takes its name from the item:
 * "Move Hull marina".
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Sortable
        label="Delivery route"
        defaultItems={[
          { id: 'leeds', name: 'Leeds depot' },
          { id: 'york', name: 'York, Fossgate' },
          { id: 'hull', name: 'Hull marina' },
        ]}
        getLabel={(stop) => stop.name}
        handle
      >
        {(stop) => (
          <Inline gap={3} align="center">
            <DragHandle />
            <Text>{stop.name}</Text>
          </Inline>
        )}
      </Sortable>
    )
  },
}
