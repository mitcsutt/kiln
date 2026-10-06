---
'@mitcsutt/kiln-ui': minor
---

`Media` takes a `size` (`xs`, `sm`, `md`, `lg` or `xl`, about 16, 20, 24, 32 and 96px tall) for a small image that sits inline beside text, like a flag by a name. The width follows `ratio`, or the image's own ratio, and `radius` and `fallback` work as before, with the corner radius capped at a fifth of the height so a small thumbnail never rounds into a pill. Without `size`, `Media` still fills its container.
