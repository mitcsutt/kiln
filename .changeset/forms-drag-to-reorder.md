---
'@mitcsutt/kiln-forms': minor
---

`Repeater` can reorder its items by dragging. `reorderable="drag"` (or `"reorderable": "drag"` in a schema) adds a drag handle to each item, beside its Move up and Move down buttons, that moves the item by pointer, touch or keyboard: Space or Enter picks it up, the arrow keys move it, Space or Enter drops it and Escape puts it back, and each step is announced. The item's values, errors and touched state move with it, and keyboard focus stays on its handle. Drag and drop comes from the new `@mitcsutt/kiln-forms/dnd` entry, built on `@mitcsutt/kiln-dnd`, an optional peer dependency: install it, import `@mitcsutt/kiln-dnd/styles.css` after kiln-ui's stylesheet, and give your kit its `dragAndDrop` with `kit.extend({ dragAndDrop })`. Without it, those repeaters show the move buttons alone. The words come from a new `drag` group in `FormMessages`. Repeaters without `"drag"`, and forms that never import the entry, don't change.
