---
'@mitcsutt/kiln-ui': patch
---

`List.Leading`, `List.Content`, `List.Description` and `List.Trailing` render `<div>`s, so block components such as `Stat`, `Stack` and a sized `Media` fit in them as valid HTML. Inside an `asChild` row (a link or button) they stay `<span>`s, the only content a button may hold. A `Stat` in `List.Trailing` lines its label and value up on the row's end edge, through a new `--stat-align` token (`start` or `end`).
