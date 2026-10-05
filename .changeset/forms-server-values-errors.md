---
'@mitcsutt/kiln-forms': patch
---

`useServerValues` keeps an error across a refresh only on a value the refresh left alone. A field that takes a new server value no longer shows the error its old value had. Kept errors now stay visible under every `errorVisibility` policy (with `'submit'`, the refresh used to hide them) and aren't announced again as alerts.
