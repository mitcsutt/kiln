---
'@mitcsutt/kiln-ui': minor
---

Add `Collapse`, `Collapsible` and `Transition`, the shared motion primitives. `Collapse` animates content open and closed by height, `Collapsible` adds a trigger wired with `aria-expanded` and `aria-controls`, and `Transition` mounts an element with an enter animation and unmounts it after an exit (`fade`, `slide-up`, `slide-down`, `scale`, `pop`, or your own keyframes). All three take their timing from the theme's motion tokens and change instantly under reduced motion.
