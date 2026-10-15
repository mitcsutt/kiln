import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dnd, Draggable, DropZone } from '@mitcsutt/kiln-dnd'
import { Card, Grid, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { expectAnnouncement, storyRoot } from '#stories/play'

const meta = {
  title: 'Drag and drop/Components/DropZone',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Photo {
  kind: 'photo' | 'document'
}

function Uploads() {
  const [log, setLog] = useState('Nothing filed yet.')
  return (
    <Dnd>
      <Stack gap={4}>
        <Inline gap={3}>
          <Draggable id="harbour.jpg" label="harbour.jpg" data={{ kind: 'photo' }}>
            <Card padding={3}>harbour.jpg</Card>
          </Draggable>
          <Draggable id="lease.pdf" label="lease.pdf" data={{ kind: 'document' }}>
            <Card padding={3}>lease.pdf</Card>
          </Draggable>
        </Inline>
        <Grid columns={2} gap={4}>
          <DropZone
            id="album"
            label="Album"
            accept={(item) => (item.data as Photo).kind === 'photo'}
            onDrop={(item) => {
              setLog(`${item.label} went to the album.`)
            }}
          >
            <Text>Album (photos only)</Text>
          </DropZone>
          <DropZone
            id="folder"
            label="Folder"
            onDrop={(item) => {
              setLog(`${item.label} went to the folder.`)
            }}
          >
            <Text>Folder</Text>
          </DropZone>
        </Grid>
        <Text size="sm" tone="muted">
          {log}
        </Text>
      </Stack>
    </Dnd>
  )
}

/** A zone that takes photos only: a document skips it by keyboard and never lights it. */
export const Playground: Story = {
  render: () => <Uploads />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const lease = canvas.getByText('lease.pdf').closest('[data-kiln-dnd-handle]') as HTMLElement
    lease.focus()
    await userEvent.keyboard(' ')
    await expect(canvas.getByText('Album (photos only)').parentElement).not.toHaveAttribute(
      'data-active',
    )
    await userEvent.keyboard('{ArrowDown}')
    await expectAnnouncement(root, 'lease.pdf is over Folder.')
    await userEvent.keyboard(' ')
    await expect(canvas.getByText('lease.pdf went to the folder.')).toBeInTheDocument()
  },
}

/**
 * `accept` decides which items a zone takes, from each item's `data`. Zones that don't
 * take an item stay quiet while it's dragged, and the keyboard skips them.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [last, setLast] = useState('Drop a file on a zone.')
    return (
      <Dnd>
        <Stack gap={4}>
          <Inline gap={3}>
            <Draggable id="harbour.jpg" label="harbour.jpg" data={{ kind: 'photo' }}>
              <Card padding={3}>harbour.jpg</Card>
            </Draggable>
            <Draggable id="lease.pdf" label="lease.pdf" data={{ kind: 'document' }}>
              <Card padding={3}>lease.pdf</Card>
            </Draggable>
          </Inline>
          <Grid columns={2} gap={4}>
            <DropZone
              id="album"
              label="Album"
              accept={(item) => (item.data as { kind: string }).kind === 'photo'}
              onDrop={(item) => {
                setLast(`${item.label} is in the album.`)
              }}
            >
              <Text>Album</Text>
            </DropZone>
            <DropZone
              id="folder"
              label="Folder"
              onDrop={(item) => {
                setLast(`${item.label} is in the folder.`)
              }}
            >
              <Text>Folder</Text>
            </DropZone>
          </Grid>
          <Text size="sm" tone="muted">
            {last}
          </Text>
        </Stack>
      </Dnd>
    )
  },
}
