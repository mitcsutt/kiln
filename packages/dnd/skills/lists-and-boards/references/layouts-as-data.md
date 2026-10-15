<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Layouts as data

> Lists, boards and grid layouts are plain data you can store as JSON, with pure helpers to change them in your own code.

Source: https://kiln.mitchellsutton.com/docs/drag-and-drop/getting-started/layouts-as-data

kiln-dnd never owns your data. A drop hands `onChange` the new value, and the helpers below make the same changes from your own code, such as an "Add panel" button or a sync from your server. They return new values and leave their input alone.

## Lists and boards

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

## Grid layouts

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
