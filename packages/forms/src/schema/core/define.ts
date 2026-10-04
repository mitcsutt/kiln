import type { EmptyObject } from '#core/kit/types'
import type { FormSchema } from '#schema/core/types'

/**
 * `defineSchemaFor<R, X>()` → a `defineFormSchema` bound to a kit's registries (the kit
 * exposes it as `kit.defineFormSchema`). Curried and non-generic in the schema parameter so object
 * literals get excess-property checks (§10.1): `define<Entry, Ctx>()({ version: 1, root: … })`.
 * Identity at runtime.
 */
export function defineSchemaFor<R, X = EmptyObject>() {
  return <T, C = EmptyObject>() =>
    (schema: FormSchema<T, R, X, C>): FormSchema<T, R, X, C> =>
      schema
}
