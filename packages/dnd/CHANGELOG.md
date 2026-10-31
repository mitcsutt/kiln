# @mitcsutt/kiln-dnd

## 0.2.0

### Minor Changes

- 364dc49: `GridLayout` items are never shorter than their content: an item whose content needs more rows than its entry gives it renders taller and the items below move down, so items no longer overlap as the grid narrows. The stored layout and `onChange` keep the entries' own heights. A pointer drag now stays inside the grid, so carrying an item past either side no longer widens the page or leaves it, and the carried item stays under the pointer instead of running ahead of it.

## 0.1.0

### Minor Changes

- 6e77724: Add `SortableItem`, one item of a sortable list built from your own elements, such as table rows or cards in your own layout. It renders through a function that gets a `ref` and `props` for the item's element, which draw `Sortable`'s drop line and lifted look, and it gives a `DragHandle` inside it the item to drag. `Sortable` and `Board` now render their rows through it, with no change to their markup.
- 220fd2d: Add `@mitcsutt/kiln-dnd`, drag and drop on kiln-ui. `Sortable` reorders a list, `Board` moves cards within and between columns, `GridLayout` moves and resizes panels on a grid with compaction and breakpoints, and `Draggable` drops onto `DropZone`s. The primitives under them are the `Dnd` scope and the `useSortable`, `useDraggable` and `useDroppable` hooks. Every pattern shares one keyboard model: Space or Enter picks up and drops, the arrow keys move, Shift and the arrows resize a grid item, and Escape cancels. Focus stays on the handle, and one live region announces each step, with English defaults you can replace through `announcements`. Mouse and pen drag once the pointer moves; touch needs a 250ms press. Nothing changes until the drop: lists show a drop line, grids a placeholder, and `onChange` fires once with plain data. Lists are arrays, boards are `{ column: [...] }` maps and grid layouts are `[{ i, x, y, w, h }]`, with `arrayMove`, `moveBetween`, `appendItem`, `removeItem` and `compact` to change them in code. The drag engine (dnd-kit's DOM core) loads in the browser only, so server rendering never touches it, and `@mitcsutt/kiln-dnd/testing` stubs what jsdom lacks. Import `@mitcsutt/kiln-dnd/styles.css` after kiln-ui's stylesheet.
- 220fd2d: Ship three agent skills with kiln-dnd, built from its docs pages: `lists-and-boards`, `grid-layout` and `drop-zones`.
