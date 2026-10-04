import type { Primitive } from '#core/kit/contracts'
import type {
  Computer,
  NamedValidator,
  OptionsLoader,
  ValidatorContext,
  ValidatorResult,
} from '#schema/core/types'

/** Registers an options loader for `optionsFrom: { loader: key }` (§10.5). Identity at runtime. */
export function defineLoader<V extends Primitive>(fn: OptionsLoader<V>): OptionsLoader<V> {
  return fn
}

/**
 * Registers a validator for `{ rule: 'custom', validator: key, args? }` (§10.5). Return a message to
 * fail, nothing to pass. `async: true` runs it in the async channel (debounced, abortable).
 */
export function defineValidator<V = unknown>(
  fn: (value: V, ctx: ValidatorContext) => ValidatorResult | Promise<ValidatorResult>,
  opts: { async?: boolean } = {},
): NamedValidator<V> {
  return {
    '~validator': true,
    async: opts.async === true,
    validate: fn,
  }
}

/** Registers a derived-value function for `compute: { computer: key, from }` (§10.5). */
export function defineComputer<Out>(fn: (values: unknown) => Out): Computer<Out> {
  return { '~computer': true, compute: fn }
}

/** True for a `defineValidator` result. */
export function isNamedValidator(value: unknown): value is NamedValidator {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { '~validator'?: unknown })['~validator'] === true
  )
}
