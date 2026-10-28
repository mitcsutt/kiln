---
'@mitcsutt/kiln-ui': minor
'@mitcsutt/kiln-charts': patch
'@mitcsutt/kiln-forms': patch
---

Polish for data display, from a review of the demo app.

- `TreeTable`: a click anywhere on an expandable row opens or closes it (links and buttons inside a row keep their own clicks), and the chevron has a larger target.
- `Table` and `TreeTable`: a new `bar` column width keeps room for a `Progress` or `Meter`, which have no width of their own and were squeezed to nothing in a shrink-wrapped column.
- `Table`: a cell that holds only a checkbox or radio centres it in the row, whatever the row's `valign`.
- `Card.Header` takes a `leading` slot, so an avatar sits above the title at every width and cards of one width look the same.
- `Card`: a card with a corner `Stamp` makes room for it, so the stamp no longer covers the title or the date.
- `ChartTooltip`: values are set in the theme's figures at normal width and the label weight, instead of Ledger's condensed receipt-tape figures.
- `Repeater`: actions that an item doesn't offer (Move up on the first item, Remove at `min`) keep their place as hidden slots, so a table's columns no longer reflow when a line is added.
