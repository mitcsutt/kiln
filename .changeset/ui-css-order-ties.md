---
'@mitcsutt/kiln-ui': patch
---

CodeBlock's copy button stays muted, and TagsInput's chip list stays `display: contents`, whatever order a bundler loads the CSS in. Both rules used to tie on specificity with Button's and TagList's base rules, so a Next.js build could load them in the other order and flip them.
