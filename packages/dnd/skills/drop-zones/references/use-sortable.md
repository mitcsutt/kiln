<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# useSortable

> Makes an element one item of a reorderable list.

Source: https://kiln.mitchellsutton.com/docs/drag-and-drop/hooks/use-sortable

`useSortable` is the primitive under `Sortable` and `Board`. Give each item its `index` and, for several lists, its `list`; nothing moves while the item is dragged. Instead `dropEdge` tells each item whether the drop line belongs before or after it, and the drop arrives once, in `Dnd`'s `onDragEnd`, as a target `{ kind: 'list', list, index }` you can hand to `arrayMove` or `moveBetween`.

By keyboard, the arrow keys along the list move the item through it and the arrow keys across it move it to the neighbouring list. A list is vertical unless its container says otherwise: `useDroppable({ list, orientation: 'horizontal' })`. That container is also what an item drops into when the list is empty.

Drop zones in the same `Dnd` that accept the item come after the last list: the arrow across it (Right, or Down for a horizontal list) steps onto the first zone, the arrows then step through the zones in document order, and stepping back past the first zone returns to the last list. A drop there arrives as a `{ kind: 'zone' }` target and calls the zone's `onDrop`, just as a pointer drop on the zone does.

Your own markup: one `useSortable` per item and `arrayMove` in `Dnd`'s `onDragEnd`. `dropEdge` says where to draw the drop line; `useDroppable({ list })` on the container lets an item land past the last one.

```tsx
import { arrayMove, Dnd, useDroppable, useSortable } from '@mitcsutt/kiln-dnd'
import { Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

function Step({ step, index }: { step: string; index: number }) {
  const { ref, handleProps, isDragging, dropEdge } = useSortable({ id: step, index, label: step })
  return (
    <li ref={ref} {...handleProps} data-drop-edge={dropEdge ?? undefined}>
      <Text tone={isDragging ? 'muted' : 'default'}>{step}</Text>
    </li>
  )
}

function StepList({ steps }: { steps: string[] }) {
  // The container: an item dropped past the last step lands at the end.
  const { ref } = useDroppable({ id: 'steps', label: 'Onboarding steps', list: 'list' })
  return (
    <ol ref={ref} aria-label="Onboarding steps">
      {steps.map((step, index) => (
        <Step key={step} step={step} index={index} />
      ))}
    </ol>
  )
}

function OnboardingSteps() {
  const [steps, setSteps] = useState([
    'Create the workspace',
    'Invite the team',
    'Connect the bank',
  ])
  return (
    <Dnd
      onDragEnd={({ item, target }) => {
        if (target?.kind === 'list' && item.index !== undefined) {
          const from = item.index
          setSteps((current) => arrayMove(current, from, target.index))
        }
      }}
    >
      <StepList steps={steps} />
    </Dnd>
  )
}

export function Usage() {
  return <OnboardingSteps />
}
```

## API

```ts
declare function useSortable(options: UseSortableOptions): UseSortableResult
```

Makes an element one item of a reorderable list.

`UseSortableOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | Unique within the `Dnd` scope. |
| `label` (required) | `string` |  | The item's name, as announcements and the drag handle say it. |
| `index` (required) | `number` |  | Its index in its list, from 0. |
| `list` | `string` | `list` | The list it belongs to. Items move between lists in the same `Dnd`. Default `list`. |
| `data` | `unknown` |  | Anything you want back in `onDragEnd`. |
| `disabled` | `boolean` |  | Stops the item being picked up. It can still move as others move around it. |
| `handle` | `boolean` |  | Drag by a separate handle (see `useDraggable`). |

`UseSortableResult`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ref` (required) | `(element: HTMLElement \| null) => void` |  | Put on the item. |
| `handleRef` (required) | `(element: HTMLElement \| null) => void` |  | Put on the handle, or on the item when there is no separate handle. |
| `handleProps` (required) | `DragHandleAttributes` |  | Spread onto the same element as `handleRef`. |
| `isDragging` (required) | `boolean` |  | Whether this item is being dragged. |
| `dragInput` (required) | `null \| 'keyboard' \| 'pointer'` |  | How it's being dragged: `keyboard`, `pointer`, or `null`. |
| `dropEdge` (required) | `null \| 'before' \| 'after'` |  | Where to draw the drop line around this item, if the drag would land next to it. |
