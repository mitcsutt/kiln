---
'@mitcsutt/kiln-ui': minor
---

Add `TreeTable`, a WAI-ARIA `treegrid` set in `Table`'s styles for rows in a hierarchy. Each parent has a toggle, the grid is a single tab stop, and the keyboard works like a file tree: Up and Down step by row, Right opens a row then steps into it, Left closes it then steps out, Home and End jump, and Enter follows the row's link. Rows carry `aria-level`, `aria-expanded`, `aria-setsize` and `aria-posinset`. It is a separate export, so `Table` and its imports are unchanged.
