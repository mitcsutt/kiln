---
name: lists-and-boards
description: "Use when adding drag and drop to a React app with @mitcsutt/kiln-dnd: installing it and its stylesheet, a reorderable list with Sortable, a kanban board with Board, table rows or your own markup with SortableItem, drag handles with DragHandle, controlled and uncontrolled state with onChange, arrayMove and moveBetween, the keyboard model and announcements, translating announcements, and testing drags with Testing Library."
metadata:
  purpose: Build sortable lists and boards that work by pointer, touch and keyboard and report each move as plain data.
  type: core
  library: "@mitcsutt/kiln-dnd"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/drag-and-drop/index.mdx
  - mitcsutt/kiln:apps/docs/content/docs/drag-and-drop/getting-started/keyboard-and-screen-readers.mdx
  - mitcsutt/kiln:packages/dnd/src/components/Sortable/Sortable.tsx
  - mitcsutt/kiln:packages/dnd/src/components/SortableItem/SortableItem.tsx
  - mitcsutt/kiln:packages/dnd/src/components/Board/Board.tsx
  - mitcsutt/kiln:packages/dnd/src/components/DragHandle/DragHandle.tsx
  - mitcsutt/kiln:apps/docs/content/docs/drag-and-drop/getting-started/layouts-as-data.mdx
  - mitcsutt/kiln:apps/docs/content/docs/drag-and-drop/getting-started/testing.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Reorder lists and move cards between columns

Build sortable lists and boards that work by pointer, touch and keyboard and report each move as plain data.

## Overview

Drag and drop for React on kiln-ui. Sortable lists, kanban boards, drop zones and dashboard grids share one keyboard model and one announcer.

`@mitcsutt/kiln-dnd` moves things: rows in a list, cards between columns, files onto folders, panels around a dashboard. Every pattern works the same way by pointer, touch and keyboard, says what's happening to screen reader users, and hands you plain data when something moves.

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

### Install

```sh
pnpm add @mitcsutt/kiln-dnd @mitcsutt/kiln-ui
```

kiln-ui, React and React DOM (18.3 or 19) are peer dependencies. Import the stylesheet once, after kiln-ui's:

```ts
import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-dnd/styles.css'
```

The drag engine, [dnd-kit](https://dndkit.com), is a dependency you never import. It loads in the browser once a drag surface mounts, so a server renders the finished markup and never loads it.

### Pick a pattern

- **[Sortable](references/sortable.md)**: one list you reorder.
- **[Board](references/board.md)**: columns of cards that move within and between columns.
- **[GridLayout](https://kiln.mitchellsutton.com/docs/drag-and-drop/components/grid-layout)**: a dashboard of panels you move and resize on a grid, with breakpoints.
- **[Draggable](https://kiln.mitchellsutton.com/docs/drag-and-drop/components/draggable) and [DropZone](https://kiln.mitchellsutton.com/docs/drag-and-drop/components/drop-zone)**: things you drop onto places.

For your own markup, the same behaviour comes as hooks: [useSortable](https://kiln.mitchellsutton.com/docs/drag-and-drop/hooks/use-sortable), [useDraggable](https://kiln.mitchellsutton.com/docs/drag-and-drop/hooks/use-draggable) and [useDroppable](https://kiln.mitchellsutton.com/docs/drag-and-drop/hooks/use-droppable), inside a [Dnd](https://kiln.mitchellsutton.com/docs/drag-and-drop/components/dnd) scope.

### What every pattern shares

- **One keyboard model.** Space or Enter picks an item up, the arrow keys move it, Space or Enter drops it and Escape puts it back. Focus stays on the handle. See [keyboard and screen readers](#).
- **One announcer.** Each step is said in a live region, in English by default and replaceable a string at a time.
- **Nothing moves until you drop.** Lists show a line where the item will land and grids show a placeholder; the data changes once, in `onChange`.
- **Plain data.** Lists are arrays, boards are `{ column: [...] }` maps and grid layouts are `[{ i, x, y, w, h }]`, with pure helpers to change them in your own code. See [layouts as data](references/layouts-as-data.md).
- **Touch.** Mouse and pen drag as soon as the pointer moves; touch needs a short press, so a swipe still scrolls.
- **Reduced motion.** Grid items slide into place unless the reader asks for reduced motion.
- **Themes.** The lifted look is kiln-ui's `--shadow-lift`, and the drop line and placeholder use the theme's accent, so every theme draws them its own way.

## Keyboard and screen readers

The one keyboard model every kiln-dnd pattern shares, what it announces, and how to translate it.

Every pattern in kiln-dnd uses the same keys. A drag handle (a `DragHandle`, or the whole item when there is no handle) takes focus and is described by short instructions, so a screen reader says how to use it when it's reached.

| Key                       | What it does                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Space or Enter            | Picks the item up, and drops it once it's moving                                                 |
| Arrow keys                | Move it: through a list, to the next column of a board, from zone to zone, or one cell on a grid |
| Shift and the arrow keys  | On a grid, resize it one cell                                                                    |
| Escape                    | Cancels and puts everything back                                                                 |
| Tab, or a click elsewhere | Also cancels: leaving the handle never drops by accident                                         |

When sortable items and drop zones share a `Dnd`, the zones come after the last list. The arrow across the last list (Right, or Down for a horizontal list) steps onto the first zone that accepts the item, the arrow keys then step through the zones in document order, and stepping back past the first zone returns to the last list. A pointer reaches the same zones, and a drop on one arrives the same way from either.

Focus stays on the handle the whole time, and comes back to it after a drop moves the item somewhere else in the page.

### What it says

The announcer is a live region that each scope renders once. It speaks at every step, with the item's `label` and where it is:

- "Picked up Write the 2.4 release notes, position 1 of 5."
- "Fix the export button moved to position 1 of 2 in Doing."
- "Revenue moved to row 2, column 7." and "Revenue is now 4 columns wide and 3 rows tall."
- "Invoice 1042 is over Archive."
- "Move cancelled. Run the QA pass is back at position 2 of 4."

Pointer drags are announced too, a moment after the pointer settles, so a fast drag isn't read out step by step.

### Translating

Pass `announcements` to any preset or to `Dnd` with the keys you want to change; the rest stay English. Each announcement is a function of where the item is, so word order is yours.

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

```ts
defaultAnnouncements
```

The English defaults.

### Labels

Every item needs a `label`: it's the handle's name ("Move Revenue") and the subject of every announcement. Lists and boards take `getLabel`, grid items and draggables take `label`, and drop zones are named by their own `label`, so name a zone after the destination ("Archive", not "Drop here").

## References

Read a reference when its description matches the task:

- [Sortable](references/sortable.md): A list you reorder by dragging, by pointer, touch or keyboard.
- [SortableItem](references/sortable-item.md): One item of a sortable list you build from your own elements, with `Sortable`'s look.
- [Board](references/board.md): Columns of items you move within and between columns by dragging, by pointer, touch or keyboard: a kanban board.
- [DragHandle](references/drag-handle.md): The grip a draggable item is picked up by.
- [Layouts as data](references/layouts-as-data.md): Lists, boards and grid layouts are plain data you can store as JSON, with pure helpers to change them in your own code.
- [Testing](references/testing.md): Test kiln-dnd components with Testing Library in jsdom by keyboard, and pointer drags in a real browser.
