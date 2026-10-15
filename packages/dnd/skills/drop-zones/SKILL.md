---
name: drop-zones
description: "Use when items are dropped onto targets with @mitcsutt/kiln-dnd (filing, assigning, deleting): Dnd, Draggable, DropZone, accept and onDrop, onDragEnd events; or when building custom draggable markup with the useDraggable, useDroppable and useSortable hooks."
metadata:
  purpose: Make things draggable onto drop zones, and build custom drag-and-drop markup on the same keyboard model.
  type: core
  library: "@mitcsutt/kiln-dnd"
sources:
  - mitcsutt/kiln:packages/dnd/src/components/Dnd/Dnd.tsx
  - mitcsutt/kiln:packages/dnd/src/components/Draggable/Draggable.tsx
  - mitcsutt/kiln:packages/dnd/src/components/DropZone/DropZone.tsx
  - mitcsutt/kiln:packages/dnd/src/hooks/useDraggable.ts
  - mitcsutt/kiln:packages/dnd/src/hooks/useDroppable.ts
  - mitcsutt/kiln:packages/dnd/src/hooks/useSortable.ts
  - mitcsutt/kiln:apps/docs/content/docs/drag-and-drop/getting-started/keyboard-and-screen-readers.mdx
  - mitcsutt/kiln:apps/docs/content/docs/drag-and-drop/getting-started/testing.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Drop things onto places, or build your own drag surfaces

Make things draggable onto drop zones, and build custom drag-and-drop markup on the same keyboard model.

## Dnd

The scope for draggable items and the places they drop: one keyboard model, one announcer and one drag engine for everything inside it.

`Dnd` wraps the items made with `useDraggable`, `useSortable`, `Draggable` and `DropZone`, and hears every drop in `onDragEnd`. `Sortable`, `Board` and `GridLayout` bring their own, so you only need `Dnd` for drop zones or your own sortable markup.

It renders no element of its own, just a live region for announcements and the instructions each drag handle points to. On the server and before hydration, items render as plain markup; the drag engine loads in the browser once the scope mounts, and keyboard dragging works as soon as the page is interactive.

One `Dnd` around draggable items and the zones they drop on. `onDragEnd` gets the item and where it landed; `DropZone`'s `onDrop` gets the same for its own drops.

```tsx
import { Dnd, Draggable, DropZone } from '@mitcsutt/kiln-dnd'
import { Card, Grid, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
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
}
```

### Translated

Every word is replaceable through `announcements`: the handle's instructions, its name and each step of a drag. Pass only the keys you change.

```tsx
import { Dnd, Draggable, DropZone } from '@mitcsutt/kiln-dnd'
import { Card, Stack, Text } from '@mitcsutt/kiln-ui'

export function Translated() {
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
}
```

### Keyboard

Space or Enter on a handle picks the item up. The arrow keys move it, Space or Enter drops it, and Escape (or leaving the handle) cancels and puts it back. Focus stays on the handle throughout, and returns to it after a drop moves the item.

### API

`DndProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` |  |  |
| `announcements` | `Partial<DndAnnouncements>` |  | Replace any of the words kiln-dnd says: the handle instructions, the drag handle's name and every announcement. The rest stay English. |
| `onDragStart` | `(event: DragStartEvent) => void` |  | Called when an item is picked up, by pointer or keyboard. |
| `onDragOver` | `(event: DragOverEvent) => void` |  | Called whenever the place an item would land changes. |
| `onDragEnd` | `(event: DragEndEvent) => void` |  | Called once when an item is dropped. Apply the move here. A sortable item only ends here when the drop moves it; a draggable always does, with `target: null` over no zone. |
| `onDragCancel` | `(event: DragCancelEvent) => void` |  | Called when a drag is cancelled: Escape, focus leaving the handle or a cancelled pointer drag. A sortable item dropped where nothing moves (its own slot, or over nothing) lands here too, instead of in `onDragEnd`. |
| `engineProps` | `EngineProps` |  | Options passed straight to the drag engine. An escape hatch outside semver: the engine and its options can change in any release. Read when the scope mounts. |

`DndAnnouncements`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `instructions` (required) | `string` |  | How to use a list, board or drop-zone handle. Linked to every handle with `aria-describedby`. |
| `gridInstructions` (required) | `string` |  | How to use a `GridLayout` handle, resize included. |
| `handle` (required) | `(item: string) => string` |  | The accessible name of a `DragHandle`. |
| `listLifted` (required) | `(place: ListPlace) => string` |  | An item in a list was picked up. |
| `listMoved` (required) | `(place: ListPlace) => string` |  | A picked-up list item moved. |
| `listDropped` (required) | `(place: ListPlace) => string` |  | A list item was dropped. |
| `listCanceled` (required) | `(place: ListPlace) => string` |  | A list drag was cancelled; `place` is where the item is back at. |
| `zoneLifted` (required) | `(place: ZonePlace) => string` |  | An item that drops onto zones was picked up. |
| `zoneMoved` (required) | `(place: ZonePlace) => string` |  | A picked-up item moved over a drop zone, or off every zone. |
| `zoneDropped` (required) | `(place: ZonePlace) => string` |  | An item was dropped, onto a zone or onto nothing. |
| `zoneCanceled` (required) | `(place: ZonePlace) => string` |  | A drag onto zones was cancelled. |
| `gridLifted` (required) | `(place: GridPlace) => string` |  | A grid item was picked up. |
| `gridMoved` (required) | `(place: GridPlace) => string` |  | A picked-up grid item moved. |
| `gridResized` (required) | `(place: GridPlace) => string` |  | A picked-up grid item was resized. |
| `gridDropped` (required) | `(place: GridPlace) => string` |  | A grid item was dropped. |
| `gridCanceled` (required) | `(place: GridPlace) => string` |  | A grid drag was cancelled; `place` is where the item is back at. |
| `gridLocked` (required) | `(item: string) => string` |  | A grid handle was pressed while the grid is narrower than its saved layout, where items can't be rearranged. |

`DragStartEvent`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `item` (required) | `DndItem` |  |  |
| `input` (required) | `'keyboard' \| 'pointer'` |  |  |

`DragOverEvent`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `item` (required) | `DndItem` |  |  |
| `target` (required) | `DndTarget \| null` |  |  |
| `input` (required) | `'keyboard' \| 'pointer'` |  |  |

`DragEndEvent`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `item` (required) | `DndItem` |  |  |
| `target` (required) | `DndTarget \| null` |  |  |
| `input` (required) | `'keyboard' \| 'pointer'` |  |  |

`DragCancelEvent`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `item` (required) | `DndItem` |  |  |
| `input` (required) | `'keyboard' \| 'pointer'` |  |  |

## Draggable

Something you can pick up and drop onto a `DropZone`.

`Draggable` and `DropZone` go inside one `Dnd`. Without `handle`, the whole item is the handle: it takes focus, and Space or Enter picks it up. The arrow keys then move it from zone to zone, in the order they appear on the page, and Space or Enter drops it.

A pointer drag lifts the item and leaves a faded copy where it was; touch needs a short press first, so a swipe still scrolls the page. `Draggable` adds no chrome of its own: put a `Card` or any other content inside.

Wrap the items and the places they go in one `Dnd`. Each `DropZone` hears its drops in `onDrop`, with the item's `id`, `label` and `data`.

```tsx
import { Dnd, Draggable, DropZone } from '@mitcsutt/kiln-dnd'
import { Card, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
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
}
```

### With handle

When the item holds its own buttons, drag it by a `DragHandle`: set `handle` and put the handle inside.

```tsx
import { Dnd, DragHandle, Draggable, DropZone } from '@mitcsutt/kiln-dnd'
import { Card, Inline, Stack, Text } from '@mitcsutt/kiln-ui'

export function WithHandle() {
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
}
```

### API

`DraggableProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | Unique within the `Dnd` scope. |
| `label` (required) | `string` |  | The item's name, as announcements and its handle say it ("Invoice 1042"). |
| `data` | `unknown` |  | Anything you want back in `onDragEnd` and `DropZone`'s `onDrop`. |
| `disabled` | `boolean` | `false` | Stops the item being picked up. |
| `handle` | `boolean` | `false` | Drag by a `DragHandle` inside it instead of by the whole item. Use one whenever the item holds links, buttons or fields of its own. |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>`.

## DropZone

A place to drop `Draggable` items.

A `DropZone` is a framed area. While an item it accepts is being dragged, its frame darkens; when the item would land in it, it fills with the accent's soft tint. Its `label` is what a keyboard user hears as the arrow keys bring an item over it ("Invoice 1042 is over Archive"), so name it after the destination.

`onDrop` gets the dropped item. Put the zone's own content (a heading, the items it already holds) inside it.

`accept` decides which items a zone takes, from each item's `data`. Zones that don't take an item stay quiet while it's dragged, and the keyboard skips them.

```tsx
import { Dnd, Draggable, DropZone } from '@mitcsutt/kiln-dnd'
import { Card, Grid, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
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
}
```

### API

`DropZoneProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | Unique within the `Dnd` scope. |
| `label` (required) | `string` |  | The zone's name, as announcements say it ("Archive"). |
| `accept` | `(item: DndItem) => boolean` |  | Which items it takes. Default: every item in the scope. |
| `data` | `unknown` |  | Anything you want back in `onDragEnd`'s target. |
| `disabled` | `boolean` | `false` | Stops it taking drops. |
| `onDrop` | `(item: DndItem) => void` |  | Called when an item is dropped here, with the item's `id`, `label` and `data`. |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>`.

`DndItem`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | The item's id. |
| `label` (required) | `string` |  | The item's name, as announcements say it. |
| `data` (required) | `unknown` |  | Whatever you passed as `data` when you made it draggable. |
| `list` | `string` |  | For a sortable item: the list it started in. |
| `index` | `number` |  | For a sortable item: its index there, from 0. |

## References

Read a reference when its description matches the task:

- [useDraggable](references/use-draggable.md): Makes an element draggable onto drop zones, by pointer, touch and keyboard.
- [useDroppable](references/use-droppable.md): Makes an element a place to drop draggable items.
- [useSortable](references/use-sortable.md): Makes an element one item of a reorderable list.
- [Keyboard and screen readers](references/keyboard-and-screen-readers.md): The one keyboard model every kiln-dnd pattern shares, what it announces, and how to translate it.
- [Testing](references/testing.md): Test kiln-dnd components with Testing Library in jsdom by keyboard, and pointer drags in a real browser.
