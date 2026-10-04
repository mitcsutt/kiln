---
'@mitcsutt/kiln-ui': none
'@mitcsutt/kiln-forms': none
---

Every code example in the agent skills now compiles. kiln-ui's types declare `*.css` modules, so `import '@mitcsutt/kiln-ui/styles.css'` type-checks under TypeScript 6 without a bundler's types. The skills' examples keep every element they were written with (some were missing them), and function signatures are TypeScript declarations. Neither package has been released, so this changeset bumps nothing.
