---
'@mitcsutt/kiln-ui': minor
---

A labelled `Divider` is now a band rather than a `separator`: its `label` is real content that screen readers read in place, and it may be a block (a `Stack` of lines). The rules either side stay decorative. Before, the label was only the separator's accessible name, and a separator's children are presentational. An unlabelled `Divider` is still a `separator`.
