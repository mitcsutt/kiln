import {
  getBy,
  setBy,
  type AnyFormApi,
  type StandardSchemaV1,
  type StandardSchemaV1Issue,
} from '@tanstack/react-form'
import { isDev } from '#core/env'
import { rebaseline, resetForm } from '#core/runtime/baseline'
import { focusOnInvalidSubmit } from '#core/runtime/focus'
import {
  getFormRuntime,
  isInactive,
  type AfterSubmit,
  type FormRuntime,
} from '#core/runtime/formRuntime'
import { issuePath } from '#core/runtime/paths'
import { FormSubmitError, applyServerErrors } from '#core/runtime/serverErrors'
import { routeIssues } from '#core/runtime/standardSchema'

/**
 * Thrown inside TanStack's `onSubmit` after the pipeline has already handled a failure, so
 * TanStack records `isSubmitSuccessful: false`. `guardSubmit` swallows it — callers of
 * `handleSubmit` never see a rejection.
 */
export class SubmitHandled extends Error {
  constructor() {
    super('[@mitcsutt/kiln-forms] submit failure already handled')
    this.name = 'SubmitHandled'
  }
}

const ROW = /^\[(\d+)\](.*)$/

/**
 * The `newItem` value for `name` when it sits inside a mounted repeater's row
 * (`guests[3].diet` → `getBy(newItem(), 'diet')`); the innermost repeater wins.
 */
function itemTemplateValue(
  runtime: FormRuntime,
  name: string,
): { found: boolean; value?: unknown } {
  let best: { array: string; rest: string } | undefined
  for (const array of runtime.itemTemplates.keys()) {
    if (!name.startsWith(`${array}[`)) continue
    const match = ROW.exec(name.slice(array.length))
    if (!match) continue
    if (!best || array.length > best.array.length)
      best = { array, rest: (match[2] ?? '').replace(/^\./, '') }
  }
  if (!best) return { found: false }
  const template = runtime.itemTemplates.get(best.array)?.()
  return { found: true, value: best.rest === '' ? template : getBy(template, best.rest) }
}

/** `values` with `path`'s key removed (copy-on-write along the path; an array slot is left as is). */
function deletePath(values: unknown, path: string): unknown {
  const segments = path.match(/[^.[\]]+/g) ?? []
  const remove = (node: unknown, index: number): unknown => {
    if (typeof node !== 'object' || node === null) return node
    const key = segments[index] ?? ''
    if (!Object.prototype.hasOwnProperty.call(node, key)) return node
    const record = node as Record<string, unknown>
    if (index === segments.length - 1) {
      if (Array.isArray(node)) return node
      return Object.fromEntries(Object.entries(record).filter(([own]) => own !== key))
    }
    const child = remove(record[key], index + 1)
    if (child === record[key]) return node
    if (Array.isArray(node)) {
      const copy = (node as unknown[]).slice()
      copy[Number(key)] = child
      return copy
    }
    return { ...record, [key]: child }
  }
  return remove(values, 0)
}

/**
 * Replaces the value of every inactive path marked `prune` with its default — the payload never
 * carries hidden or excluded values (§5.4). The default is the field-level `defaultValue`, else —
 * inside a mounted repeater's row — the row's `newItem` value for that field, else the form's
 * defaults. When that default is `undefined` the key is removed: a pruned path is never written as
 * `undefined`.
 */
export function prune<T>(values: T, runtime: FormRuntime, defaults: unknown): T {
  let out: unknown = values
  for (const [name, entry] of runtime.inactive) {
    if (entry.submit !== 'prune') continue
    let fallback: unknown
    if (runtime.fieldDefaults.has(name)) fallback = runtime.fieldDefaults.get(name)
    else {
      const row = itemTemplateValue(runtime, name)
      fallback = row.found ? row.value : getBy(defaults, name)
    }
    out = fallback === undefined ? deletePath(out, name) : setBy(out, name, () => fallback)
  }
  return out as T
}

export interface SubmitConfig {
  schema?: StandardSchemaV1
  afterSubmit: AfterSubmit
  onSubmit?: (ctx: {
    value: unknown
    output: unknown
    formApi: AnyFormApi
    meta: unknown
  }) => unknown
  onSubmitError?: (ctx: { error: unknown; formApi: AnyFormApi }) => void
}

/** Default handling of an unexpected throw: log it and show `messages.submitFailed` on the form. */
function defaultSubmitError(formApi: AnyFormApi, error: unknown): void {
  console.error(error)
  formApi.setErrorMap({ onServer: getFormRuntime(formApi).options.messages.submitFailed })
}

/**
 * The submit-time parse of the pruned values failed: issues on active paths go to their fields;
 * issues on inactive (pruned/excluded) paths can't be fixed by the user, so the form gets
 * `messages.submitFailed` and, in dev, a warning naming those paths. `onSubmit` is not called.
 */
function rejectParse(
  formApi: AnyFormApi,
  runtime: FormRuntime,
  issues: readonly StandardSchemaV1Issue[],
): void {
  const routed = routeIssues(issues, runtime)
  const inactivePaths = [
    ...new Set(issues.map(issuePath).filter((path) => path !== '' && isInactive(runtime, path))),
  ]
  const formErrors: unknown[] = [...(routed?.form ?? [])]
  if (inactivePaths.length > 0) {
    formErrors.push(runtime.options.messages.submitFailed)
    if (isDev()) {
      console.warn(
        `[@mitcsutt/kiln-forms] The form schema rejected values on inactive (hidden or excluded) paths: ${inactivePaths.join(', ')}. ` +
          'Those values are replaced by their defaults on submit, so the user cannot fix them. ' +
          'Make conditionally shown fields optional in the schema (or give them valid defaults).',
      )
    }
  }
  formApi.setErrorMap({
    onSubmit: {
      form: formErrors.length > 0 ? formErrors : undefined,
      fields: routed?.fields ?? {},
    },
  })
  void focusOnInvalidSubmit(formApi)
}

/** Builds TanStack's `onSubmit`: prune → parse → onSubmit → afterSubmit, or map the failure (§5.5). */
export function createSubmitHandler(getConfig: () => SubmitConfig) {
  return async ({
    value,
    formApi,
    meta,
  }: {
    value: unknown
    formApi: AnyFormApi
    meta: unknown
  }): Promise<void> => {
    const config = getConfig()
    const runtime = getFormRuntime(formApi)
    const pruned = prune(value, runtime, formApi.options.defaultValues)

    const fail = (error: unknown): never => {
      if (error instanceof FormSubmitError) {
        applyServerErrors(formApi, error.errors as never)
        void focusOnInvalidSubmit(formApi)
      } else if (config.onSubmitError) {
        config.onSubmitError({ error, formApi })
      } else {
        defaultSubmitError(formApi, error)
      }
      throw new SubmitHandled()
    }

    // §5.5 step 2: `output` is only ever a successful parse of the pruned values.
    let output: unknown = pruned
    if (config.schema) {
      let result: Awaited<ReturnType<StandardSchemaV1['~standard']['validate']>>
      try {
        result = await config.schema['~standard'].validate(pruned)
      } catch (error) {
        // A throwing/rejecting schema is an unexpected failure (§5.5 step 6), never a rejection.
        return fail(error)
      }
      if (result.issues) {
        rejectParse(formApi, runtime, result.issues)
        throw new SubmitHandled()
      }
      output = result.value
    }

    try {
      await config.onSubmit?.({ value: pruned, output, formApi, meta })
    } catch (error) {
      fail(error)
    }

    switch (config.afterSubmit) {
      case 'rebaseline':
        rebaseline(formApi, pruned)
        break
      case 'reset':
        resetForm(formApi, 'defaults')
        break
      case 'lock':
        runtime.locked = true
        runtime.notify()
        break
      case 'keep':
        break
    }
  }
}

interface Patchable {
  handleSubmit: (...args: never[]) => Promise<void>
  reset: (...args: never[]) => void
}

const guarded = new WeakSet<object>()

/**
 * Makes `handleSubmit` never reject with our sentinel, ignores it while a submit is in flight,
 * and unlocks `afterSubmit: 'lock'` on `reset()`. Applied to both TanStack's core FormApi and
 * the React extended form (they hold separate copies of these methods).
 */
export function guardSubmit(target: AnyFormApi): void {
  if (guarded.has(target)) return
  guarded.add(target)
  const patchable = target as unknown as Patchable
  const originalSubmit = patchable.handleSubmit
  const originalReset = patchable.reset
  patchable.handleSubmit = (...args: never[]) => {
    if (target.state.isSubmitting) return Promise.resolve()
    return originalSubmit(...args).catch((error: unknown) => {
      if (!(error instanceof SubmitHandled)) throw error
    })
  }
  patchable.reset = (...args: never[]) => {
    const runtime = getFormRuntime(target)
    if (runtime.locked) {
      runtime.locked = false
      runtime.notify()
    }
    originalReset(...args)
  }
}
