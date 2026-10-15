# @mitcsutt/kiln-dnd

Drag and drop for React on [`@mitcsutt/kiln-ui`](../ui): sortable lists, kanban boards, drop zones and dashboard grids. Every pattern works by pointer, touch and keyboard, says each step to screen reader users, and hands you plain data when something moves.

## Install

```sh
pnpm add @mitcsutt/kiln-dnd @mitcsutt/kiln-ui
```

`@mitcsutt/kiln-ui`, React and React DOM (18.3 or 19) are peer dependencies. Import the stylesheet once, after kiln-ui's:

```ts
import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-dnd/styles.css'
```

The drag engine, [dnd-kit](https://dndkit.com)'s DOM core, is a dependency you never import. It loads in the browser once a drag surface mounts, so server rendering never loads it.

## Usage

```tsx
import { Sortable } from '@mitcsutt/kiln-dnd'
import { useState } from 'react'

export function Checklist() {
  const [tasks, setTasks] = useState([
    { id: 'notes', title: 'Write the release notes' },
    { id: 'qa', title: 'Run the QA pass' },
    { id: 'tag', title: 'Tag the release' },
  ])
  return (
    <Sortable
      label="Release checklist"
      items={tasks}
      onChange={setTasks}
      getLabel={(task) => task.title}
    >
      {(task) => task.title}
    </Sortable>
  )
}
```

A dashboard grid stores its layout as plain data, `[{ i, x, y, w, h }]`:

```tsx
import { DragHandle, GridLayout } from '@mitcsutt/kiln-dnd'

;<GridLayout
  label="Sales dashboard"
  layout={layout}
  onChange={saveLayout}
  columns={{ base: 4, md: 8, lg: 12 }}
>
  <GridLayout.Item id="revenue" label="Revenue">
    <Card>
      <DragHandle />…
    </Card>
  </GridLayout.Item>
</GridLayout>
```

## What's in it

- **Components:** `Sortable`, `Board`, `GridLayout`, `Draggable`, `DropZone`, `DragHandle` and the `Dnd` scope.
- **Hooks:** `useSortable`, `useDraggable` and `useDroppable`, for your own markup.
- **Helpers:** `arrayMove`, `moveBetween`, `appendItem`, `removeItem` and `compact`.
- **Testing:** `stubDndBrowserApis` from `@mitcsutt/kiln-dnd/testing` for jsdom.

The keyboard model is the same everywhere: Space or Enter picks up and drops, the arrow keys move (Shift and the arrows resize a grid item), and Escape cancels.

Docs: [kiln.mitchellsutton.com/docs/drag-and-drop](https://kiln.mitchellsutton.com/docs/drag-and-drop). Agent skills ship in `skills/`; run `npx @tanstack/intent@latest install` to load them.

## Licence

MIT. `src/grid/engine/` holds code from react-grid-layout 2.3.0, also MIT; its notice is in [`LICENSE`](LICENSE).
