---
'@mitcsutt/kiln-eslint-config': minor
---

Files in any `scripts/` folder may now import dev dependencies, like test files, stories and tool config files, so an app's build and codegen scripts no longer need their own `import-x/no-extraneous-dependencies` override. `restrict-template-expressions` now allows numbers (`${count} items`) and still rejects `undefined`, `null`, booleans, `any` and objects. The README and docs show how to silence pnpm's `eslint-plugin-jsx-a11y` peer warning.
