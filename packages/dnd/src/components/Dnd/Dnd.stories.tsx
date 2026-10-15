import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dnd, Draggable, DropZone, type DragEndEvent } from '@mitcsutt/kiln-dnd'
import { Card, Grid, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { expectAnnouncement, storyRoot } from '#stories/play'

const meta = {
  title: 'Drag and drop/Components/Dnd',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Shifts() {
  const [log, setLog] = useState<string[]>([])
  const record = ({ item, target, input }: DragEndEvent) => {
    const where = target?.kind === 'zone' ? target.label : 'nowhere'
    setLog((lines) => [`${item.label} to ${where}, by ${input}`, ...lines])
  }
  return (
    <Dnd onDragEnd={record}>
      <Stack gap={4}>
        <Draggable id="kwame" label="Kwame Mensah">
          <Card padding={3}>Kwame Mensah</Card>
        </Draggable>
        <Grid columns={2} gap={4}>
          <DropZone id="early" label="Early shift">
            <Text>Early shift</Text>
          </DropZone>
          <DropZone id="late" label="Late shift">
            <Text>Late shift</Text>
          </DropZone>
        </Grid>
        <Text size="sm" tone="muted">
          {log[0] ?? 'No moves yet.'}
        </Text>
      </Stack>
    </Dnd>
  )
}

/** `onDragEnd` hears every drop in the scope, with the input that made it. */
export const Playground: Story = {
  render: () => <Shifts />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    ;(canvas.getByText('Kwame Mensah').closest('[data-kiln-dnd-handle]') as HTMLElement).focus()
    await userEvent.keyboard(' {ArrowDown}{ArrowDown} ')
    await expectAnnouncement(root, 'Dropped Kwame Mensah on Late shift.')
    await expect(canvas.getByText('Kwame Mensah to Late shift, by keyboard')).toBeInTheDocument()
  },
}

/**
 * One `Dnd` around draggable items and the zones they drop on. `onDragEnd` gets the item
 * and where it landed; `DropZone`'s `onDrop` gets the same for its own drops.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [shift, setShift] = useState('unassigned')
    return (
      <Dnd
        onDragEnd={({ target }) => {
          if (target?.kind === 'zone') setShift(target.label)
        }}
      >
        <Stack gap={4}>
          <Draggable id="kwame" label="Kwame Mensah">
            <Card padding={3}>Kwame Mensah: {shift}</Card>
          </Draggable>
          <Grid columns={2} gap={4}>
            <DropZone id="early" label="Early shift">
              <Text>Early shift</Text>
            </DropZone>
            <DropZone id="late" label="Late shift">
              <Text>Late shift</Text>
            </DropZone>
          </Grid>
        </Stack>
      </Dnd>
    )
  },
}

/**
 * Every word is replaceable through `announcements`: the handle's instructions, its name
 * and each step of a drag. Pass only the keys you change.
 */
export const Translated: Story = {
  tags: ['docs'],
  render: function Translated() {
    return (
      <Dnd
        announcements={{
          instructions:
            'Pulsa Espacio o Intro para coger. Usa las flechas para mover, Espacio o Intro para soltar y Escape para cancelar.',
          zoneLifted: ({ item }) => `${item} cogido.`,
          zoneMoved: ({ item, zone }) =>
            zone ? `${item} sobre ${zone}.` : `${item} fuera de las zonas.`,
          zoneDropped: ({ item, zone }) =>
            zone ? `${item} soltado en ${zone}.` : `${item} no se ha movido.`,
          zoneCanceled: ({ item }) => `Cancelado. ${item} vuelve a su sitio.`,
        }}
      >
        <Stack gap={4}>
          <Draggable id="factura" label="Factura 1042">
            <Card padding={3}>Factura 1042</Card>
          </Draggable>
          <DropZone id="archivo" label="Archivo">
            <Text>Archivo</Text>
          </DropZone>
        </Stack>
      </Dnd>
    )
  },
}
