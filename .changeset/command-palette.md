---
'@mitcsutt/kiln-ui': minor
---

Add `CommandPalette`, a keyboard-first launcher that searches every page and action in an app. It opens from a `trigger` button, a page-wide `shortcut` such as `mod+k`, or `open`, and is a modal dialog, so focus is trapped inside and returns to whatever opened it. Actions share `Combobox`'s option shape and ranking (`label`, `description`, `keywords`, `group`, `disabled`), are listed under their group headings with the matched text marked, and show their own `shortcut` as keys. The arrow keys, Home and End move, and Enter runs the highlighted action, which is the best match as you type. An action with its own `actions` opens them as a nested page that Backspace, Escape or the back button leaves. It also takes `filter="none"` with `loading` for results from your own search, `limit`, and `recent` action ids to list first while the search is empty, recorded through `onAction`.
