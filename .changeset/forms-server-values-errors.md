---
'@mitcsutt/kiln-forms': patch
---

`useServerValues` keeps an error across a refresh only on a value the refresh left alone. A field that takes a new server value no longer shows the error its old value had. Kept errors now stay visible under every `errorVisibility` policy (with `'submit'`, the refresh used to hide them) and one that a submit or a step's Next had quieted isn't announced again as an alert.
