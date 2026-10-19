<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# SortableItem

> One item of a sortable list you build from your own elements, with `Sortable`'s look.

Source: https://kiln.mitchellsutton.com/docs/drag-and-drop/components/sortable-item

`SortableItem` is `useSortable` with what `Sortable` draws around each row: the drop line, the lifted look, and the context a `DragHandle` inside it needs. Use it when the items can't be list items, such as table rows or cards in your own layout. Put `ref` and `props` on the item's element, inside a `Dnd` that applies the move in `onDragEnd`.

With `handle`, put a `DragHandle` inside the item; without it, the whole element is the handle and takes focus.

Items that can't be list items, such as table rows: one `SortableItem` per row, with `ref` and `props` on the row, inside a `Dnd` that applies the move with `arrayMove`. `useDroppable({ list })` on the table body lets a row land after the last one.

```tsx
import { arrayMove, Dnd, DragHandle, SortableItem, useDroppable } from '@mitcsutt/kiln-dnd'
import { Table } from '@mitcsutt/kiln-ui'
import { useState, type ReactNode } from 'react'

interface Stop {
  id: string
  name: string
  window: string
}

const route: Stop[] = [
  { id: 'leeds', name: 'Leeds depot', window: '07:30' },
  { id: 'york', name: 'York, Fossgate', window: '09:15' },
  { id: 'hull', name: 'Hull marina', window: '11:00' },
  { id: 'beverley', name: 'Beverley market', window: '12:40' },
]

/** The table body is the list's container, so a row can land after the last one. */
function Stops({ children }: { children: ReactNode }) {
  const { ref } = useDroppable({ id: 'stops', label: 'Delivery stops', list: 'stops' })
  return <Table.Body ref={ref}>{children}</Table.Body>
}

function RouteTable() {
  const [stops, setStops] = useState(route)
  return (
    <Dnd
      onDragEnd={({ item, target }) => {
        if (target?.kind !== 'list' || item.index === undefined) return
        const from = item.index
        setStops((current) => arrayMove(current, from, target.index))
      }}
    >
      <Table aria-label="Delivery stops">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell width="min">Order</Table.HeaderCell>
            <Table.HeaderCell>Stop</Table.HeaderCell>
            <Table.HeaderCell align="end">Window</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Stops>
          {stops.map((stop, index) => (
            <SortableItem
              key={stop.id}
              id={stop.id}
              index={index}
              label={stop.name}
              list="stops"
              handle
            >
              {({ ref, props }) => (
                <Table.Row ref={ref} {...props}>
                  <Table.Cell>
                    <DragHandle />
                  </Table.Cell>
                  <Table.Cell>{stop.name}</Table.Cell>
                  <Table.Cell align="end">{stop.window}</Table.Cell>
                </Table.Row>
              )}
            </SortableItem>
          ))}
        </Stops>
      </Table>
    </Dnd>
  )
}

export function Usage() {
  return <RouteTable />
}
```

## API

`SortableItemProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `vertical` | The list's direction, for where the drop line is drawn. Default `vertical`. |
| `children` (required) | `(item: SortableItemRender) => ReactNode` |  | Renders the item's element, with `ref` and `props` on it. |
| `id` (required) | `string` |  | Unique within the `Dnd` scope. |
| `label` (required) | `string` |  | The item's name, as announcements and the drag handle say it. |
| `index` (required) | `number` |  | Its index in its list, from 0. |
| `list` | `string` | `list` | The list it belongs to. Items move between lists in the same `Dnd`. Default `list`. |
| `data` | `unknown` |  | Anything you want back in `onDragEnd`. |
| `disabled` | `boolean` | `false` | Stops the item being picked up. It can still move as others move around it. |
| `handle` | `boolean` | `false` | Drag by a separate handle (see `useDraggable`). |

`SortableItemRender`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ref` (required) | `(element: HTMLElement \| null) => void` |  | Put on the item's element. |
| `props` (required) | `SortableItemAttributes` |  | Spread onto the same element. Merge your own `className` with `props.className`. |
| `isDragging` (required) | `boolean` |  | Whether this item is being dragged. |
