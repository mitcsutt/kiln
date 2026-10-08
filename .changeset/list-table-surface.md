---
'@mitcsutt/kiln-ui': minor
---

`List` and `Table` take `surface` (`none`, `surface` or `raised`) to set their rows on one sheet, with Card's edges, so they read as rows on a textured or coloured canvas. Rows run edge to edge and the sheet clips them to its corners: highlighted, selected and hovered fills are bands across the sheet, a categorical rail is the row's edge (flush with the sheet, full height, following the corners on the first and last rows), and a table on a sheet gets a little more air, compact included. A table caption lines up with the first column and a sticky header takes the sheet's fill. New component tokens: `--list-surface-bg`, `--list-surface-radius`, `--table-surface-bg` and `--table-surface-radius`.
