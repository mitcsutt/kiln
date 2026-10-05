# @mitcsutt/kiln-eslint-config

## 0.3.0

### Minor Changes

- 1ef6bf4: Add `@mitcsutt/kiln-eslint-config/docs-stories`, with the `kiln/docs-story` rule, for docs sites that show stories as copyable examples. A story tagged `docs` needs a JSDoc caption, a `render` that takes no args, imports from packages only and no `style`, and the tag goes on each story, never on the meta.

## 0.2.0

### Minor Changes

- b14cd6e: Files in any `scripts/` folder may now import dev dependencies, like test files, stories and tool config files, so an app's build and codegen scripts no longer need their own `import-x/no-extraneous-dependencies` override. `restrict-template-expressions` now allows numbers (`${count} items`) and still rejects `undefined`, `null`, booleans, `any` and objects. The README and docs show how to silence pnpm's `eslint-plugin-jsx-a11y` peer warning.
