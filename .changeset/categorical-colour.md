---
'@mitcsutt/kiln-ui': minor
---

Carry a person's or team's categorical colour beyond `Tag` and `Avatar`. `List.Item` and `Table.Row` take `color` (1 to 8) and draw a thin rail at the row's start, `Card` takes `color` and draws a keyline along its top, and `Box` and `Section` take `surface="cat-1"` to `"cat-8"`, a fill whose ink, lines and nested surfaces re-point to stay legible. The shared `CategoryColor` type is exported. Component tokens: `--list-rail-width`, `--table-rail-width`, `--card-keyline-width`.
