---
'@mitcsutt/kiln-eslint-config': minor
---

Three fixes from using the config in an app:

- `@typescript-eslint/non-nullable-type-assertion-style` is off. It rewrote `x as T` into `x!`, which `no-non-null-assertion` then reported, so `eslint --fix` traded one error for the other.
- Test support files may import dev dependencies: anything under a `test/`, `tests/`, `testing/` or `__mocks__/` folder, `*.setup.*` files, and `vitest.workspace.*` / `vitest.setup.*`. React Fast Refresh rules skip them too.
- `@typescript-eslint/only-throw-error` allows TanStack Router's `redirect()` and `notFound()` (the `Redirect` and `NotFoundError` types from `@tanstack/router-core`). Every other non-Error throw is still reported.
