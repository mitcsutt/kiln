<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Sortable

> A list you reorder by dragging, by pointer, touch or keyboard.

Source: https://kiln.mitchellsutton.com/docs/drag-and-drop/components/sortable

`Sortable` renders a list of rows. Nothing moves while an item is dragged: a line shows where it will land, and the list reorders once, on drop, through `onChange`. By keyboard, Space or Enter picks an item up, the arrow keys move it, Space or Enter drops it and Escape puts it back, and each step is announced ("Write release notes moved to position 3 of 5").

Pass `items` and `onChange` to own the order, or `defaultItems` to let the list keep it. `onChange` gets the new array, so `setItems` is usually all it needs. To move items in your own code, use `arrayMove`.

Without `handle`, the whole row is the handle. With `handle`, put a `DragHandle` in each row; the rest of the row keeps its own clicks and keys.

A list that keeps its own order: pass `defaultItems`. Drag a row, or focus it and press Space, then use the arrow keys. A line shows where it will land.

```tsx
import { Sortable } from '@mitcsutt/kiln-dnd'

export function Usage() {
  return (
    <Sortable
      label="Release checklist"
      defaultItems={[
        { id: 'notes', title: 'Write the 2.4 release notes' },
        { id: 'qa', title: 'Run the QA pass on Android' },
        { id: 'tag', title: 'Tag v2.4.0 and build the installers' },
        { id: 'post', title: 'Post the changelog to the forum' },
      ]}
      getLabel={(task) => task.title}
    >
      {(task) => task.title}
    </Sortable>
  )
}
```

## Controlled

Own the order with `items` and `onChange`. `onChange` fires once per drop with the new array, so it can go straight into state or to your API.

```tsx
import { Sortable } from '@mitcsutt/kiln-dnd'
import { Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Controlled() {
  const [tasks, setTasks] = useState([
    { id: 'notes', title: 'Release notes' },
    { id: 'qa', title: 'QA pass' },
    { id: 'tag', title: 'Tag and build' },
  ])
  return (
    <Stack gap={4}>
      <Sortable
        label="Launch steps"
        items={tasks}
        onChange={setTasks}
        getLabel={(task) => task.title}
      >
        {(task) => task.title}
      </Sortable>
      <Text tone="muted" size="sm">
        Order: {tasks.map((task) => task.title).join(', ')}
      </Text>
    </Stack>
  )
}
```

## With handles

Rows with their own links and buttons drag by a `DragHandle`, so a click on the link stays a click. Set `handle` and put the handle in each row.

```tsx
import { DragHandle, Sortable } from '@mitcsutt/kiln-dnd'
import { Button, Inline, Link, Stack, Text } from '@mitcsutt/kiln-ui'

export function WithHandles() {
  return (
    <Sortable
      label="Speakers, in running order"
      defaultItems={[
        { id: 'okafor', name: 'Chidi Okafor', talk: 'Ten years of offline sync' },
        { id: 'lind', name: 'Maja Lind', talk: 'Designing for slow phones' },
        { id: 'reyes', name: 'Lucía Reyes', talk: 'What our support inbox taught us' },
      ]}
      getLabel={(speaker) => speaker.name}
      handle
    >
      {(speaker) => (
        <Inline gap={3} align="center" justify="between">
          <Inline gap={3} align="center">
            <DragHandle />
            <Stack gap={1}>
              <Link href={`#${speaker.id}`}>{speaker.name}</Link>
              <Text size="sm" tone="muted">
                {speaker.talk}
              </Text>
            </Stack>
          </Inline>
          <Button size="sm" variant="ghost">
            Edit
          </Button>
        </Inline>
      )}
    </Sortable>
  )
}
```

## Horizontal

`orientation="horizontal"` for a row: Left and Right move the item along it.

```tsx
import { Sortable } from '@mitcsutt/kiln-dnd'
import { Tag } from '@mitcsutt/kiln-ui'

export function Horizontal() {
  return (
    <Sortable
      label="Filter order"
      orientation="horizontal"
      defaultItems={[
        { id: 'status', label: 'Status' },
        { id: 'owner', label: 'Owner' },
        { id: 'due', label: 'Due date' },
        { id: 'region', label: 'Region' },
      ]}
      getLabel={(filter) => filter.label}
    >
      {(filter) => <Tag>{filter.label}</Tag>}
    </Sortable>
  )
}
```

## API

`SortableProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `readonly T[]` |  | The items, in order. Pass with `onChange` to control the list. |
| `defaultItems` | `readonly T[]` |  | The starting items for a list that keeps its own order. |
| `onChange` | `((items: T[], move: SortableMove<T>) => void)` |  | Called once per drop that changes the order, with the new array and what moved. |
| `children` (required) | `(item: T, state: SortableItemState) => ReactNode` |  | Renders one item. |
| `label` (required) | `string` |  | The list's accessible name ("Release checklist"). |
| `getLabel` (required) | `(item: T) => string` |  | Each item's name, as announcements and its handle say it. |
| `getId` | `((item: T) => string)` |  | Each item's id, unique in the list. Default: the item's `id` field. |
| `isDisabled` | `((item: T) => boolean)` |  | Items that can't be picked up. They still shift as others move around them. |
| `orientation` | `'horizontal' \| 'vertical'` | `vertical` | `vertical` (default) for a column of rows; `horizontal` for a row of items. |
| `handle` | `boolean` |  | Drag by a `DragHandle` inside each item instead of the whole item. Use it whenever the items hold links, buttons or fields. |
| `announcements` | `Partial<DndAnnouncements>` |  | Replace any of the words the list says (see `Dnd`). |

Also accepts every prop of `HTMLAttributes<HTMLUListElement>`.

`SortableMove`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `item` (required) | `T` |  | The item that moved. |
| `from` (required) | `number` |  | Its index before, from 0. |
| `to` (required) | `number` |  | Its index now, from 0. |
| `input` (required) | `'keyboard' \| 'pointer'` |  | How it was moved. |

`SortableItemState`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` (required) | `number` |  | The item's index, from 0. |
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
