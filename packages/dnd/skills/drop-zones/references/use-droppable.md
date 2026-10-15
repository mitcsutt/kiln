<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# useDroppable

> Makes an element a place to drop draggable items.

Source: https://kiln.mitchellsutton.com/docs/drag-and-drop/hooks/use-droppable

`useDroppable` is the primitive under `DropZone`. While an item it accepts is dragged, `isActive` is true; `isOver` is true when the item would land here. A keyboard user reaches drop zones with the arrow keys, in document order, and hears each zone's `label`.

Your own drop target: `ref` on it, and `isOver` and `isActive` to draw its states.

```tsx
import { Dnd, Draggable, useDroppable } from '@mitcsutt/kiln-dnd'
import { Card, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

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

export function Usage() {
  return <Drafts />
}
```

## API

```ts
declare function useDroppable(options: UseDroppableOptions): UseDroppableResult
```

Makes an element a place to drop draggable items.

`UseDroppableOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | Unique within the `Dnd` scope. |
| `label` (required) | `string` |  | The zone's name, as announcements say it ("Archive"). |
| `accept` | `(item: DndItem) => boolean` |  | Which items it takes. Default: every item in the scope. |
| `data` | `unknown` |  | Anything you want back in `onDragEnd`'s target. |
| `disabled` | `boolean` |  | Stops it taking drops. |
| `onDrop` | `(item: DndItem) => void` |  | Called when an item is dropped here. |
| `list` | `string` |  | Makes this the container of a sortable list (the `list` its `useSortable` items name) instead of a drop zone: an item dropped on it, or moved into it by keyboard while it's empty, joins the list. |
| `orientation` | `'horizontal' \| 'vertical'` | `vertical` | For a list container: the list's direction. Default `vertical`. |

`UseDroppableResult`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ref` (required) | `(element: HTMLElement \| null) => void` |  | Put on the drop target. |
| `isOver` (required) | `boolean` |  | Whether the dragged item would land here if dropped now. |
| `isActive` (required) | `boolean` |  | Whether an item this target accepts is being dragged. |
