---
'@mitcsutt/kiln-ui': minor
---

`Tooltip` works on touch screens and on disabled triggers. `touch="longpress"` opens the tooltip when the trigger is held for half a second on a touch screen, and swallows the tap that ends the press (and the phone's context menu), so holding a button to read its hint doesn't also press it. A disabled trigger is wrapped in a focusable span that takes the hover, focus and long press, so its tooltip can still say why it's disabled.
