---
'@mitcsutt/kiln-ui': minor
---

Add `NavLinksGroup` for nested navigation. In a vertical nav a group is a disclosure button over an indented list, opens by itself when it holds the current page, and supports tree-style arrow keys; in a horizontal nav it opens its links in a panel. Groups can link to a landing page of their own, and items and groups take an `icon` and a `trailing` count. `NavLinksGroup` is a separate import, so a `NavLinks` without groups renders exactly as before and costs no more to import.
