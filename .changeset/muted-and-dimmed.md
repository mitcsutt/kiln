---
'@mitcsutt/kiln-ui': minor
---

Show what's out of play: `List.Item` and `Table.Row` take `muted`, which drops every ink in the row to the muted step (still AA), and `Media` takes `dimmed`, which fades the image toward a neutral grey while keeping it recognisable (`--media-dim-filter`, default `saturate(0.3) contrast(0.7)`).
