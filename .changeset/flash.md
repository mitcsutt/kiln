---
'@mitcsutt/kiln-ui': minor
---

Add `Flash`, which draws brief attention to an element that just changed or that a link just opened on. It wraps any single element, adds no element of its own, and gives it an outline in the accent that fades: each time its `value` changes after the first render, and whenever the element is the URL's `#target`. Under reduced motion the outline holds and goes instead of fading. Tokens: `--flash-color`, `--flash-duration`.
