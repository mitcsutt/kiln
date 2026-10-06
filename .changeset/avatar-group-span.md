---
'@mitcsutt/kiln-ui': patch
---

`AvatarGroup` renders a `<span role="group">` instead of a `<div>`, like `Avatar`, so a group can sit inside a button (a reaction chip) or a line of text. Its ref is typed `HTMLElement`.
