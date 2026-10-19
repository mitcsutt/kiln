---
'@mitcsutt/kiln-dnd': minor
---

Add `SortableItem`, one item of a sortable list built from your own elements, such as table rows or cards in your own layout. It renders through a function that gets a `ref` and `props` for the item's element, which draw `Sortable`'s drop line and lifted look, and it gives a `DragHandle` inside it the item to drag. `Sortable` and `Board` now render their rows through it, with no change to their markup.
