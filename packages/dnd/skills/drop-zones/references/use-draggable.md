<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# useDraggable

> Makes an element draggable onto drop zones, by pointer, touch and keyboard.

Source: https://kiln.mitchellsutton.com/docs/drag-and-drop/hooks/use-draggable

`useDraggable` is the primitive under `Draggable`. Render it inside a `Dnd` with one or more drop zones (`DropZone` or `useDroppable`): Space or Enter on the handle picks the item up, the arrow keys move it from zone to zone, Space or Enter drops it and Escape cancels. Each step is announced. A pointer drag lifts the element and follows the pointer; touch needs a short press first, so a swipe still scrolls.

The drop arrives in `Dnd`'s `onDragEnd` and the zone's `onDrop`, with the `data` you gave the item.

Put `ref` on the item and spread `handleProps` on it (or on its handle, with `handle: true`). It reaches drop zones made with `useDroppable` or `DropZone`.

```tsx
import { Dnd, useDraggable, useDroppable } from '@mitcsutt/kiln-dnd'
import { Inline, Stack, Tag, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

function Label({ name }: { name: string }) {
  const { ref, handleProps, isDragging } = useDraggable({ id: name, label: name })
  return (
    <span ref={ref} {...handleProps} data-dragging={isDragging ? '' : undefined}>
      <Tag>{name}</Tag>
    </span>
  )
}

function Tray({ onDrop }: { onDrop: (name: string) => void }) {
  const { ref, isOver } = useDroppable({
    id: 'urgent',
    label: 'Urgent',
    onDrop: (item) => {
      onDrop(item.label)
    },
  })
  return (
    <div ref={ref}>
      <Text tone={isOver ? 'accent' : 'muted'}>Drop here to mark it urgent</Text>
    </div>
  )
}

function Labels() {
  const [urgent, setUrgent] = useState<string[]>([])
  return (
    <Dnd>
      <Stack gap={4}>
        <Inline gap={2}>
          {['Billing', 'Refund', 'Login'].map((name) => (
            <Label key={name} name={name} />
          ))}
        </Inline>
        <Tray
          onDrop={(name) => {
            setUrgent((current) => [...current, name])
          }}
        />
        <Text size="sm">Urgent: {urgent.join(', ') || 'none'}</Text>
      </Stack>
    </Dnd>
  )
}

export function Usage() {
  return <Labels />
}
```

## API

```ts
declare function useDraggable(options: UseDraggableOptions): UseDraggableResult
```

Makes an element draggable onto drop zones, by pointer, touch and keyboard.

`UseDraggableOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | Unique within the `Dnd` scope. |
| `label` (required) | `string` |  | The item's name, as announcements and the drag handle say it ("Invoice 1042"). |
| `data` | `unknown` |  | Anything you want back in `onDragEnd` and `DropZone`'s `onDrop`. |
| `disabled` | `boolean` |  | Stops the item being picked up. |
| `handle` | `boolean` |  | Drag by a separate handle: put `handleRef` and `handleProps` on it (a `DragHandle` does this for you). Without one, the whole element is the handle. Use a handle whenever the item holds its own links or buttons. |

`UseDraggableResult`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ref` (required) | `(element: HTMLElement \| null) => void` |  | Put on the draggable element. |
| `handleRef` (required) | `(element: HTMLElement \| null) => void` |  | Put on the handle, or on the element itself when there is no separate handle. |
| `handleProps` (required) | `DragHandleAttributes` |  | Spread onto the same element as `handleRef`: focusability, instructions and the keys. |
| `isDragging` (required) | `boolean` |  | Whether this item is being dragged. |
| `dragInput` (required) | `null \| 'keyboard' \| 'pointer'` |  | How it's being dragged: `keyboard`, `pointer`, or `null`. |
