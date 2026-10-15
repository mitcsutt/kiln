---
'@mitcsutt/kiln-ui': minor
---

Add `ShowMore`, which clamps any content to a number of `lines`, a `maxHeight` on the space scale, or `maxItems` of the list it wraps, with a toggle that appears only when there's more to show. The docs gain a "Clamping content" pattern: layout and text components never take clamp props; wrap them in `ShowMore`.
