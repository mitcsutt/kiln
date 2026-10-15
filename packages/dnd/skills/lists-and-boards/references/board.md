<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Board

> Columns of items you move within and between columns by dragging, by pointer, touch or keyboard: a kanban board.

Source: https://kiln.mitchellsutton.com/docs/drag-and-drop/components/board

`Board` takes the columns in order and each column's items as a map, `{ todo: […], doing: […] }`. A line shows where a dragged item will land, and the board changes once, on drop, through `onChange`, which gets the whole new map. To move items in your own code, use `moveBetween`.

By keyboard, Space or Enter picks an item up. Up and Down move it within its column, Left and Right move it to the next column, Space or Enter drops it and Escape puts it back. Each step is announced with the column's name ("Fix the export button moved to position 1 of 3 in Doing").

Each column has a heading (level 3 unless you set `headingLevel`) and a count. An empty column still takes drops.

Columns in order, and each column's items in a map keyed by column id. Move cards with the pointer, or focus one and use Space and the arrow keys.

```tsx
import { Board } from '@mitcsutt/kiln-dnd'

export function Usage() {
  return (
    <Board
      label="Sprint 14"
      columns={[
        { id: 'todo', label: 'To do' },
        { id: 'doing', label: 'Doing' },
        { id: 'done', label: 'Done' },
      ]}
      defaultItems={{
        todo: [
          { id: 'kb-212', title: 'Fix the CSV export for 10,000-row reports' },
          { id: 'kb-219', title: 'Draft the overdue-invoice email' },
        ],
        doing: [{ id: 'kb-198', title: 'Speed up search on the orders page' }],
        done: [],
      }}
      getLabel={(issue) => issue.title}
    >
      {(issue) => issue.title}
    </Board>
  )
}
```

## With handles

Cards with their own links drag by a `DragHandle`. `onChange` gets the whole new map and the move, so you can save just the one card that changed.

```tsx
import { Board, DragHandle } from '@mitcsutt/kiln-dnd'
import { Avatar, Inline, Link, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function WithHandles() {
  const [items, setItems] = useState<
    Record<string, { id: string; title: string; owner: string }[]>
  >({
    todo: [
      { id: 'kb-212', title: 'Fix the CSV export', owner: 'Priya Nair' },
      { id: 'kb-224', title: 'Add Welsh to the language picker', owner: 'Tomás Ortega' },
    ],
    doing: [{ id: 'kb-198', title: 'Speed up order search', owner: 'Hana Kobayashi' }],
    done: [{ id: 'kb-187', title: 'Move receipts storage', owner: 'Ama Owusu' }],
  })
  const [last, setLast] = useState('Nothing moved yet.')
  return (
    <Stack gap={4}>
      <Board
        label="Sprint 14"
        columns={[
          { id: 'todo', label: 'To do' },
          { id: 'doing', label: 'Doing' },
          { id: 'done', label: 'Done' },
        ]}
        items={items}
        onChange={(next, move) => {
          setItems(next)
          setLast(`${move.item.id} moved from ${move.from.column} to ${move.to.column}.`)
        }}
        getLabel={(issue) => issue.title}
        handle
      >
        {(issue) => (
          <Stack gap={2}>
            <Inline gap={2} align="center" justify="between">
              <Link href={`#${issue.id}`}>{issue.id.toUpperCase()}</Link>
              <DragHandle />
            </Inline>
            <Text size="sm">{issue.title}</Text>
            <Inline gap={2} align="center">
              <Avatar name={issue.owner} size="sm" />
              <Text size="xs" tone="muted">
                {issue.owner}
              </Text>
            </Inline>
          </Stack>
        )}
      </Board>
      <Text size="sm" tone="muted">
        {last}
      </Text>
    </Stack>
  )
}
```

## API

`BoardProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` (required) | `readonly BoardColumn[]` |  | The columns, in order. |
| `items` | `Readonly<Record<string, readonly T[]>>` |  | The items of each column, keyed by column id. Pass with `onChange` to control the board. |
| `defaultItems` | `Readonly<Record<string, readonly T[]>>` |  | The starting items for a board that keeps its own state. |
| `onChange` | `((items: Record<string, T[]>, move: BoardMove<T>) => void)` |  | Called once per drop that moves an item, with every column's items and what moved. |
| `children` (required) | `(item: T, state: BoardItemState) => ReactNode` |  | Renders one item. |
| `label` (required) | `string` |  | The board's accessible name ("Release board"). |
| `getLabel` (required) | `(item: T) => string` |  | Each item's name, as announcements and its handle say it. |
| `getId` | `((item: T) => string)` |  | Each item's id, unique across the board. Default: the item's `id` field. |
| `isDisabled` | `((item: T) => boolean)` |  | Items that can't be picked up. |
| `handle` | `boolean` |  | Drag by a `DragHandle` inside each item instead of the whole item. |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3` | The level of the column headings. Default 3. |
| `announcements` | `Partial<DndAnnouncements>` |  | Replace any of the words the board says (see `Dnd`). |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>`.

`BoardColumn`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | The key of its items in `items`. |
| `label` (required) | `string` |  | Its heading, and its name in announcements ("Doing"). |

`BoardMove`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `item` (required) | `T` |  | The item that moved. |
| `from` (required) | `ListPosition` |  | Where it was: its column and index there. |
| `to` (required) | `ListPosition` |  | Where it is now. |
| `input` (required) | `'keyboard' \| 'pointer'` |  | How it was moved. |

`BoardItemState`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `column` (required) | `string` |  | The item's column. |
| `index` (required) | `number` |  | Its index there, from 0. |
| `isDragging` (required) | `boolean` |  | Whether it's being dragged. |

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
