---
'@mitcsutt/kiln-tsconfig': none
---

Fix the README's combined `extends` example: `react` goes last, because `library` re-applies `base`'s `lib` and would drop the DOM libraries. The package hasn't been released, so this changeset bumps nothing.
