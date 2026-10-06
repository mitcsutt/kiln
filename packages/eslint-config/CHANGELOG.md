# @mitcsutt/kiln-eslint-config

## 0.4.0

### Minor Changes

- b1ea52d: Three fixes from using the config in an app:

  - `@typescript-eslint/non-nullable-type-assertion-style` is off. It rewrote `x as T` into `x!`, which `no-non-null-assertion` then reported, so `eslint --fix` traded one error for the other.
  - Test support files may import dev dependencies: anything under a `test/`, `tests/`, `testing/` or `__mocks__/` folder, `*.setup.*` files, and `vitest.workspace.*` / `vitest.setup.*`. React Fast Refresh rules skip them too.
  - `@typescript-eslint/only-throw-error` allows TanStack Router's `redirect()` and `notFound()` (the `Redirect` and `NotFoundError` types from `@tanstack/router-core`). Every other non-Error throw is still reported.

## 0.3.0

### Minor Changes

- 1ef6bf4: Add `@mitcsutt/kiln-eslint-config/docs-stories`, with the `kiln/docs-story` rule, for docs sites that show stories as copyable examples. A story tagged `docs` needs a JSDoc caption, a `render` that takes no args, imports from packages only and no `style`, and the tag goes on each story, never on the meta.

## 0.2.0

### Minor Changes

- b14cd6e: Files in any `scripts/` folder may now import dev dependencies, like test files, stories and tool config files, so an app's build and codegen scripts no longer need their own `import-x/no-extraneous-dependencies` override. `restrict-template-expressions` now allows numbers (`${count} items`) and still rejects `undefined`, `null`, booleans, `any` and objects. The README and docs show how to silence pnpm's `eslint-plugin-jsx-a11y` peer warning.
