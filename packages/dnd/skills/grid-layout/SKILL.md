---
name: grid-layout
description: "Use when building a dashboard or any grid of panels users move and resize with @mitcsutt/kiln-dnd: GridLayout and GridLayout.Item, layouts as [{ i, x, y, w, h }] data, columns per breakpoint, row height and gap, compaction, size limits and static items, keyboard move and resize, and changing a layout in code with appendItem, removeItem and compact."
metadata:
  purpose: Build grids of panels that move and resize by pointer and keyboard, stored as plain layout data.
  type: core
  library: "@mitcsutt/kiln-dnd"
sources:
  - mitcsutt/kiln:packages/dnd/src/components/GridLayout/GridLayout.tsx
  - mitcsutt/kiln:apps/docs/content/docs/drag-and-drop/getting-started/layouts-as-data.mdx
  - mitcsutt/kiln:apps/docs/content/docs/drag-and-drop/getting-started/keyboard-and-screen-readers.mdx
  - mitcsutt/kiln:packages/dnd/src/components/DragHandle/DragHandle.tsx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Build a dashboard grid you can rearrange

Build grids of panels that move and resize by pointer and keyboard, stored as plain layout data.

## GridLayout

A dashboard grid: items you move and resize on a grid of columns and rows, by pointer, touch or keyboard.

The layout is plain data, one `{ i, x, y, w, h }` per item in grid units, so you can store it as JSON. Each `GridLayout.Item` matches an entry by `id` and is dragged by the `DragHandle` you put inside it; a grip in its corner resizes it. While an item is dragged, a placeholder shows where it will land and the other items make room; the layout changes once, on drop, through `onChange`.

By keyboard, Space or Enter on a handle picks the item up. The arrow keys move it one cell, Shift and the arrow keys resize it one cell, Space or Enter drops it and Escape puts everything back. Each step is announced ("Revenue moved to row 2, column 7").

Gaps close upward by default (`compaction`). Give `columns` per breakpoint and the grid picks a column count from its own width; you store the layout for the widest, and narrower ones are generated from it, read-only. Use `appendItem`, `removeItem` and `compact` to change the layout in your own code. Movement animates, except under reduced motion.

A layout is plain data: one `{ i, x, y, w, h }` per item, in columns and rows. Each `GridLayout.Item` is dragged by the `DragHandle` inside it, and resized from its corner.

```tsx
import { DragHandle, GridLayout } from '@mitcsutt/kiln-dnd'
import { Amount, Card, Inline, Numeral, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <GridLayout
      label="Sales dashboard"
      defaultLayout={[
        { i: 'revenue', x: 0, y: 0, w: 8, h: 2 },
        { i: 'orders', x: 8, y: 0, w: 4, h: 2 },
        { i: 'tickets', x: 0, y: 2, w: 12, h: 1 },
      ]}
      rowHeight={8}
    >
      <GridLayout.Item id="revenue" label="Revenue">
        <Card padding={4}>
          <Inline gap={2} align="center" justify="between">
            <Text weight="strong">Revenue</Text>
            <DragHandle />
          </Inline>
          <Amount value={48210.4} currency="GBP" />
        </Card>
      </GridLayout.Item>
      <GridLayout.Item id="orders" label="Orders">
        <Card padding={4}>
          <Inline gap={2} align="center" justify="between">
            <Text weight="strong">Orders</Text>
            <DragHandle />
          </Inline>
          <Numeral value={1284} />
        </Card>
      </GridLayout.Item>
      <GridLayout.Item id="tickets" label="Open tickets">
        <Card padding={4}>
          <Inline gap={2} align="center" justify="between">
            <Text weight="strong">Open tickets: 19</Text>
            <DragHandle />
          </Inline>
        </Card>
      </GridLayout.Item>
    </GridLayout>
  )
}
```

### Controlled

Own the layout to store it: `onChange` fires once per drop. `appendItem` and `removeItem` change it in your own code and close the gaps they leave.

```tsx
import { appendItem, DragHandle, GridLayout, removeItem, type GridItem } from '@mitcsutt/kiln-dnd'
import { Button, Card, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Controlled() {
  const [layout, setLayout] = useState<GridItem[]>([
    { i: 'revenue', x: 0, y: 0, w: 6, h: 2 },
    { i: 'orders', x: 6, y: 0, w: 6, h: 2 },
  ])
  const hasRefunds = layout.some((item) => item.i === 'refunds')
  return (
    <Stack gap={4}>
      <Inline gap={3}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setLayout((current) =>
              hasRefunds
                ? removeItem(current, 'refunds', { columns: 12 })
                : appendItem(current, { i: 'refunds', w: 4, h: 2 }, { columns: 12 }),
            )
          }}
        >
          {hasRefunds ? 'Remove refunds' : 'Add refunds'}
        </Button>
      </Inline>
      <GridLayout label="Sales dashboard" layout={layout} onChange={setLayout} rowHeight={8}>
        {layout.map((item) => (
          <GridLayout.Item key={item.i} id={item.i} label={item.i}>
            <Card padding={4}>
              <Inline gap={2} align="center" justify="between">
                <Text weight="strong">{item.i}</Text>
                <DragHandle />
              </Inline>
            </Card>
          </GridLayout.Item>
        ))}
      </GridLayout>
    </Stack>
  )
}
```

### Responsive

Give `columns` per breakpoint and the grid picks its column count from its own width. You store one layout, for the widest; narrower ones are generated from it and can't be rearranged. This one sits in a narrow container, so it shows 4 columns.

```tsx
import { DragHandle, GridLayout } from '@mitcsutt/kiln-dnd'
import { Card, Container, Inline, Text } from '@mitcsutt/kiln-ui'

export function Responsive() {
  return (
    <Container width="narrow">
      <GridLayout
        label="Sales dashboard"
        columns={{ base: 4, md: 8, lg: 12 }}
        defaultLayout={[
          { i: 'revenue', x: 0, y: 0, w: 6, h: 2 },
          { i: 'orders', x: 6, y: 0, w: 6, h: 2 },
        ]}
        rowHeight={8}
      >
        <GridLayout.Item id="revenue" label="Revenue">
          <Card padding={4}>
            <Inline gap={2} align="center" justify="between">
              <Text weight="strong">Revenue</Text>
              <DragHandle />
            </Inline>
          </Card>
        </GridLayout.Item>
        <GridLayout.Item id="orders" label="Orders">
          <Card padding={4}>
            <Inline gap={2} align="center" justify="between">
              <Text weight="strong">Orders</Text>
              <DragHandle />
            </Inline>
          </Card>
        </GridLayout.Item>
      </GridLayout>
    </Container>
  )
}
```

### API

`GridLayoutProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `layout` | `readonly T[]` |  | The layout: one `{ i, x, y, w, h }` per item. Pass with `onChange` to control it. |
| `defaultLayout` | `readonly T[]` |  | The starting layout for a grid that keeps its own. |
| `onChange` | `((layout: T[], change: GridChange) => void)` |  | Called once per drop that changes the layout, never during a drag. |
| `columns` | `number \| Partial<Record<GridBreakpoint, number>>` | `12` | The column count, or one per breakpoint (`{ base: 4, md: 8, lg: 12 }`). The layout you store is for the widest; narrower ones are generated from it. Default 12. |
| `rowHeight` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12` | `9` | The height of one row, as a space step. Default 9. |
| `gap` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12` | `4` | The gap between items, as a space step. Default 4. |
| `compaction` | `'none' \| 'horizontal' \| 'vertical'` | `vertical` | How gaps close after a change. Default `vertical`. |
| `label` (required) | `string` |  | The grid's accessible name ("Sales dashboard"). |
| `announcements` | `Partial<DndAnnouncements>` |  | Replace any of the words the grid says (see `Dnd`). |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>`.

`GridLayoutItemProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | Matches the `i` of the item's entry in the layout. |
| `label` (required) | `string` |  | The item's name, as announcements and its handle say it ("Revenue"). |
| `resizable` | `boolean` |  | Hide the resize grip. Keyboard resizing stays available unless the item is static. |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>`.

`GridChange`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | The id of the item that moved or was resized. |
| `input` (required) | `'keyboard' \| 'pointer'` |  | How it was changed. |

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

## Layouts as data

Lists, boards and grid layouts are plain data you can store as JSON, with pure helpers to change them in your own code.

kiln-dnd never owns your data. A drop hands `onChange` the new value, and the helpers below make the same changes from your own code, such as an "Add panel" button or a sync from your server. They return new values and leave their input alone.

### Lists and boards

A `Sortable` list is an array. `arrayMove` moves one entry.

```ts
declare function arrayMove<T>(items: readonly T[], from: number, to: number): T[]
```

Moves one entry of a list to a new index and returns a new array. The input is left
alone. An index out of range is clamped, so `arrayMove(items, 0, Infinity)` moves the
first entry to the end.

A `Board` is a map from column id to that column's items. `moveBetween` moves one entry between columns, or within one, and keeps every untouched column's array as it was, so a memoised column doesn't re-render.

```ts
declare function moveBetween<T>(lists: Readonly<Record<string, readonly T[]>>, from: ListPosition, to: ListPosition): Record<string, T[]>
```

Moves one entry from one list of a map to another (or within one list) and returns a
new map. Lists that don't change keep their identity. This is the shape `Board` reads
and writes: `{ todo: […], doing: […], done: […] }`.

### Grid layouts

A `GridLayout` layout is an array of `{ i, x, y, w, h }`, in columns and rows. Store the one for your widest breakpoint; narrower ones are generated from it. Fields of your own on each item are kept through every change.

```json
[
  { "i": "revenue", "x": 0, "y": 0, "w": 6, "h": 2 },
  { "i": "orders", "x": 6, "y": 0, "w": 6, "h": 2, "minW": 3 }
]
```

`minW`, `maxW`, `minH` and `maxH` limit resizing, and `static: true` pins an item in place.

```tsx
import { appendItem, DragHandle, GridLayout, removeItem, type GridItem } from '@mitcsutt/kiln-dnd'
import { Button, Card, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Controlled() {
  const [layout, setLayout] = useState<GridItem[]>([
    { i: 'revenue', x: 0, y: 0, w: 6, h: 2 },
    { i: 'orders', x: 6, y: 0, w: 6, h: 2 },
  ])
  const hasRefunds = layout.some((item) => item.i === 'refunds')
  return (
    <Stack gap={4}>
      <Inline gap={3}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setLayout((current) =>
              hasRefunds
                ? removeItem(current, 'refunds', { columns: 12 })
                : appendItem(current, { i: 'refunds', w: 4, h: 2 }, { columns: 12 }),
            )
          }}
        >
          {hasRefunds ? 'Remove refunds' : 'Add refunds'}
        </Button>
      </Inline>
      <GridLayout label="Sales dashboard" layout={layout} onChange={setLayout} rowHeight={8}>
        {layout.map((item) => (
          <GridLayout.Item key={item.i} id={item.i} label={item.i}>
            <Card padding={4}>
              <Inline gap={2} align="center" justify="between">
                <Text weight="strong">{item.i}</Text>
                <DragHandle />
              </Inline>
            </Card>
          </GridLayout.Item>
        ))}
      </GridLayout>
    </Stack>
  )
}
```

```ts
declare function appendItem<T extends GridItem>(layout: readonly T[], item: Omit<T, 'x' | 'y'> & { x?: number | undefined; y?: number | undefined; }, options: CompactOptions): T[]
```

Adds an item at the bottom of a layout, then compacts. `x` defaults to 0 and `w` is
clamped to the column count.

```ts
declare function removeItem<T extends GridItem>(layout: readonly T[], i: string, options: CompactOptions): T[]
```

Removes the item with id `i` from a layout, then compacts so the gap closes.

```ts
declare function compact<T extends GridItem>(layout: readonly T[], options: CompactOptions): T[]
```

Closes the gaps in a layout and keeps every item inside the columns. Returns a new
layout in the same order; the input is left alone.

## References

Read a reference when its description matches the task:

- [Keyboard and screen readers](references/keyboard-and-screen-readers.md): The one keyboard model every kiln-dnd pattern shares, what it announces, and how to translate it.
- [DragHandle](references/drag-handle.md): The grip a draggable item is picked up by.
