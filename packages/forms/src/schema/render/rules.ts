import type { AnyFieldApi } from '@tanstack/react-form'
import type { NormalisedError } from '#core/binding/errors'
import type { AnyKitForm } from '#core/kit/types'
import { formatErrorText, getFormRuntime } from '#core/runtime/formRuntime'
import type { FormMessages } from '#core/runtime/messages'
import { compileRules, type CompiledRules } from '#schema/core/rules'
import { DEFAULT_EMPTIES } from '#schema/core/toStandardSchema'
import type { NamedValidator, UntypedRule } from '#schema/core/types'

/** Async custom validators are debounced (§10.4). */
export const ASYNC_RULE_DEBOUNCE_MS = 300

interface CacheEntry {
  messages: FormMessages
  validators: Readonly<Record<string, NamedValidator>>
  compiled: CompiledRules
}

// Compiled per rules array (i.e. per node object, §12.6), recompiled only when the form's messages
// or the kit's validators change identity. Messages are resolved at compile time by the core.
const cache = new WeakMap<readonly UntypedRule[], CacheEntry>()

/** The compiled rules for a rules array, in the messages the form uses right now. */
export function compiledRules(
  rules: readonly UntypedRule[],
  kind: string | undefined,
  form: AnyKitForm,
  validators: Readonly<Record<string, NamedValidator>>,
): CompiledRules {
  const messages = getFormRuntime(form).options.messages
  const hit = cache.get(rules)
  if (hit?.messages === messages && hit.validators === validators) return hit.compiled
  const empty =
    kind !== undefined && Object.prototype.hasOwnProperty.call(DEFAULT_EMPTIES, kind)
      ? DEFAULT_EMPTIES[kind]
      : undefined
  const compiled = compileRules(rules, { validators, messages, empty })
  cache.set(rules, { messages, validators, compiled })
  return compiled
}

interface SyncProps {
  value: unknown
  fieldApi: AnyFieldApi
}
interface AsyncProps extends SyncProps {
  signal: AbortSignal
}

/** TanStack field validators: one `onDynamic` (sync rules) + one `onDynamicAsync` (async validators). */
export interface RuleValidators {
  onDynamic?: (props: SyncProps) => NormalisedError | undefined
  onDynamicAsync?: (props: AsyncProps) => Promise<NormalisedError | undefined>
  onDynamicAsyncDebounceMs?: number
}

/**
 * Field-level validators for JSON rules. They mount and unmount with the field (§10.4), so a
 * hidden field never validates. `undefined` when there are no rules.
 */
export function ruleValidators(
  rules: readonly UntypedRule[],
  kind: string | undefined,
  form: AnyKitForm,
  validators: Readonly<Record<string, NamedValidator>>,
): RuleValidators | undefined {
  if (rules.length === 0) return undefined
  const initial = compiledRules(rules, kind, form, validators)
  const out: RuleValidators = {}
  if (initial.sync) {
    out.onDynamic = ({ value, fieldApi }) =>
      compiledRules(rules, kind, form, validators).sync?.(value, fieldApi.form.state.values)
  }
  if (initial.async) {
    out.onDynamicAsync = async ({ value, fieldApi, signal }) =>
      compiledRules(rules, kind, form, validators).async?.(
        value,
        fieldApi.form.state.values,
        signal,
      )
    out.onDynamicAsyncDebounceMs = ASYNC_RULE_DEBOUNCE_MS
  }
  return out
}

/** `warnRules` → the binding's `warn` prop (non-blocking, sync rules only). */
export function ruleWarning(
  rules: readonly UntypedRule[],
  kind: string,
  form: AnyKitForm,
  values: () => unknown,
  validators: Readonly<Record<string, NamedValidator>>,
): ((value: unknown) => string | undefined) | undefined {
  if (rules.length === 0) return undefined
  return (value) => {
    const error = compiledRules(rules, kind, form, validators).sync?.(value, values())
    return error ? formatErrorText(getFormRuntime(form), error) : undefined
  }
}
