---
'@mitcsutt/kiln-ui': minor
---

`Tooltip` works on touch screens and on disabled triggers. `touch="longpress"` opens the tooltip when the trigger is held for half a second on a touch screen, and swallows the tap that ends the press (and the phone's context menu), so holding a button to read its hint doesn't also press it. A `disabled` trigger is marked `aria-disabled` instead, with its clicks and key presses blocked, so it still looks and announces as disabled but hover, focus and long press reach it and its tooltip can say why. It stays the same element, so a trigger that's disabled while a request is pending keeps keyboard focus.
