import {
  evaluate,
  type AnyFieldApi,
  type AnyFormApi,
  type AnyFormOptions,
} from '@tanstack/react-form'
import type { NormalisedError } from '#core/binding/errors'
import type { KitFormAsyncValidatorFn, KitFormOptions, KitFormValidatorFn } from '#core/kit/types'
import { focusOnInvalidSubmit } from '#core/runtime/focus'
import {
  getFormRuntime,
  isInactive,
  runtimeDeriveRules,
  type FormRuntime,
  type RuntimeDeriveRule,
} from '#core/runtime/formRuntime'
import { mergeMessages, type FormMessages } from '#core/runtime/messages'
import { isAtOrUnder, normalisePath } from '#core/runtime/paths'
import {
  isStandardSchema,
  schemaValidator,
  schemaValidatorAsync,
} from '#core/runtime/standardSchema'
import { createSubmitHandler, guardSubmit } from '#core/runtime/submit'
import { kitValidationLogic } from '#core/runtime/validationLogic'

/** Kit-level defaults (`createFormKit({ messages, formatError })`). */
export interface KitDefaults {
  messages?: Partial<FormMessages>
  formatError?: (error: NormalisedError) => string
}

type LooseOptions = KitFormOptions<unknown, unknown, unknown>
/** What a form validator returns: nothing, an error, or `{ form?, fields }`. */
type FormResult = unknown

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEmptyError(value: unknown): boolean {
  return value === undefined || value === null || value === false || value === ''
}

/**
 * Normalises a form validator's result for TanStack: `{ form?, fields? }` gets a `fields` key
 * (TanStack only treats objects with `fields` as routed), field paths are normalised
 * (`a.0.b` → `a[0].b`), inactive paths are dropped, and an empty result becomes `undefined`.
 */
export function normaliseFormResult(raw: unknown, runtime: FormRuntime): FormResult {
  if (isEmptyError(raw)) return undefined
  if (isRecord(raw) && !('message' in raw) && ('fields' in raw || 'form' in raw)) {
    const fields: Record<string, unknown> = {}
    const source = isRecord(raw.fields) ? raw.fields : {}
    for (const [rawPath, error] of Object.entries(source)) {
      if (isEmptyError(error)) continue
      const path = normalisePath(rawPath)
      if (isInactive(runtime, path)) continue
      fields[path] = error
    }
    const form = isEmptyError(raw.form) ? undefined : raw.form
    if (form === undefined && Object.keys(fields).length === 0) return undefined
    return form === undefined ? { fields } : { form, fields }
  }
  return raw
}

type SyncFormValidator = (props: { value: unknown; formApi: AnyFormApi }) => FormResult
type AsyncFormValidator = (props: {
  value: unknown
  formApi: AnyFormApi
  signal: AbortSignal
}) => Promise<FormResult>

function wrapSync(
  validator: KitFormValidatorFn<unknown> | object | undefined,
): SyncFormValidator | undefined {
  if (!validator) return undefined
  if (isStandardSchema(validator)) return schemaValidator(validator)
  const fn = validator as KitFormValidatorFn<unknown>
  return (props) => normaliseFormResult(fn(props), getFormRuntime(props.formApi))
}

function wrapAsync(
  validator: KitFormAsyncValidatorFn<unknown> | object | undefined,
): AsyncFormValidator | undefined {
  if (!validator) return undefined
  if (isStandardSchema(validator)) return schemaValidatorAsync(validator)
  const fn = validator as KitFormAsyncValidatorFn<unknown>
  return async (props) => normaliseFormResult(await fn(props), getFormRuntime(props.formApi))
}

function toList(value: unknown): unknown[] {
  if (isEmptyError(value)) return []
  return Array.isArray(value) ? value : [value]
}

/** Merges two normalised results (form errors and per-field errors concatenated). */
function mergeResults(a: FormResult, b: FormResult): FormResult {
  if (a === undefined) return b
  if (b === undefined) return a
  const routedA =
    isRecord(a) && 'fields' in a
      ? (a as { form?: unknown; fields: Record<string, unknown> })
      : { form: a, fields: {} }
  const routedB =
    isRecord(b) && 'fields' in b
      ? (b as { form?: unknown; fields: Record<string, unknown> })
      : { form: b, fields: {} }
  const fields: Record<string, unknown> = { ...routedA.fields }
  for (const [path, error] of Object.entries(routedB.fields)) {
    fields[path] = path in fields ? [...toList(fields[path]), ...toList(error)] : error
  }
  const form = [...toList(routedA.form), ...toList(routedB.form)]
  return form.length === 0 ? { fields } : { form: form.length === 1 ? form[0] : form, fields }
}

function combineSync(
  ...validators: (SyncFormValidator | undefined)[]
): SyncFormValidator | undefined {
  const present = validators.filter((v): v is SyncFormValidator => v !== undefined)
  if (present.length <= 1) return present[0]
  return (props) =>
    present.reduce<FormResult>((acc, validator) => mergeResults(acc, validator(props)), undefined)
}

function combineAsync(
  ...validators: (AsyncFormValidator | undefined)[]
): AsyncFormValidator | undefined {
  const present = validators.filter((v): v is AsyncFormValidator => v !== undefined)
  if (present.length <= 1) return present[0]
  return async (props) => {
    const results = await Promise.all(present.map((validator) => validator(props)))
    return results.reduce<FormResult>((acc, result) => mergeResults(acc, result), undefined)
  }
}

const listenerTimers = new WeakMap<FormRuntime, Map<string, ReturnType<typeof setTimeout>>>()

/** Writes the runtime options for this render (read by bindings and components below). */
export function configureRuntime(
  runtime: FormRuntime,
  options: LooseOptions,
  kit: KitDefaults,
): void {
  runtime.options = {
    errorVisibility: options.errorVisibility ?? 'blur',
    validateOn: options.validateOn ?? 'blur',
    focusOnInvalid: options.focusOnInvalid ?? 'auto',
    afterSubmit: options.afterSubmit ?? 'rebaseline',
    formatError: options.formatError ?? kit.formatError ?? ((error) => error.message),
    messages: mergeMessages(kit.messages, options.messages),
  }
  runtime.userDefaults = options.defaultValues
  if (runtime.baseline && !evaluate(runtime.baseline.source, options.defaultValues))
    runtime.baseline = null
}

/** Maps kit options to TanStack `FormOptions` (§3.5). */
export function toTanStackOptions(options: LooseOptions, runtime: FormRuntime): AnyFormOptions {
  const validators = options.validators ?? {}
  const schema = options.schema
  const listeners = options.listeners ?? {}

  const onChange = ({ formApi, fieldApi }: { formApi: AnyFormApi; fieldApi: AnyFieldApi }) => {
    // TanStack types a field's name as `any`; it is always the field's path.
    const fieldName = fieldApi.name as string
    // Lets the validation logic evaluate the "live" predicate for the field being changed (§5.2).
    runtime.changing = fieldName
    queueMicrotask(() => {
      if (runtime.changing === fieldName) runtime.changing = null
    })
    // §6.9 `derive` option + rules registered at runtime (schema `compute`, §10.6): same semantics.
    // A rule fires when the changed path is a `from` path or nested under one (`shares[0].amount`
    // under `shares`).
    const rules = [
      ...((options.derive ?? []) as readonly RuntimeDeriveRule[]),
      ...runtimeDeriveRules(runtime),
    ]
    const changing = runtime.changing
    for (const rule of rules) {
      if (
        rule.field === fieldName ||
        !rule.from.some((from) => isAtOrUnder(fieldName, normalisePath(from)))
      )
        continue
      const next = rule.compute(formApi.state.values)
      if (!evaluate(next, formApi.getFieldValue(rule.field))) {
        formApi.setFieldValue(rule.field, next, { dontUpdateMeta: true })
      }
    }
    // A mounted derived field's own change listener sets `changing` to its name; the user's field
    // is still the one being validated.
    runtime.changing = changing
    const user = listeners.onChange
    if (!user) return
    const delay = listeners.onChangeDebounceMs ?? 0
    if (delay <= 0) {
      user({ formApi, fieldApi })
      return
    }
    let timers = listenerTimers.get(runtime)
    if (!timers) {
      timers = new Map()
      listenerTimers.set(runtime, timers)
    }
    const pending = timers.get(fieldName)
    if (pending) clearTimeout(pending)
    timers.set(
      fieldName,
      setTimeout(() => {
        timers.delete(fieldName)
        user({ formApi, fieldApi })
      }, delay),
    )
  }

  const defaultValues =
    runtime.baseline && evaluate(runtime.baseline.source, options.defaultValues)
      ? runtime.baseline.values
      : options.defaultValues

  const result: AnyFormOptions = {
    defaultValues,
    validationLogic: kitValidationLogic({
      validateOn: options.validateOn ?? 'blur',
      base: options.validationLogic,
    }),
    validators: {
      onMount: wrapSync(validators.onMount),
      onChange: wrapSync(validators.onChange),
      onChangeAsync: wrapAsync(validators.onChangeAsync),
      onChangeAsyncDebounceMs: validators.onChangeAsyncDebounceMs,
      onBlur: wrapSync(validators.onBlur),
      onBlurAsync: wrapAsync(validators.onBlurAsync),
      onBlurAsyncDebounceMs: validators.onBlurAsyncDebounceMs,
      onSubmit: wrapSync(validators.onSubmit),
      onSubmitAsync: wrapAsync(validators.onSubmitAsync),
      onDynamic: combineSync(
        schema && !options.schemaAsync ? schemaValidator(schema) : undefined,
        wrapSync(validators.onDynamic),
      ),
      onDynamicAsync: combineAsync(
        schema && options.schemaAsync ? schemaValidatorAsync(schema) : undefined,
        wrapAsync(validators.onDynamicAsync),
      ),
      onDynamicAsyncDebounceMs: validators.onDynamicAsyncDebounceMs,
    },
    listeners: {
      onBlur: listeners.onBlur,
      onBlurDebounceMs: listeners.onBlurDebounceMs,
      onSubmit: listeners.onSubmit,
      onChange,
      onMount: (props: { formApi: AnyFormApi }) => {
        runtime.core = props.formApi
        guardSubmit(props.formApi)
        listeners.onMount?.(props)
      },
    },
    onSubmit: createSubmitHandler(() => ({
      schema,
      afterSubmit: runtime.options.afterSubmit,
      onSubmit: options.onSubmit,
      onSubmitError: options.onSubmitError,
    })),
    onSubmitInvalid: ({ value, formApi }: { value: unknown; formApi: AnyFormApi }) => {
      // TanStack skips form-level validators when a field is invalid; run them so every error shows.
      if (!formApi.state.isFieldsValid) {
        const pending = formApi.validate('submit')
        if (pending instanceof Promise) pending.catch(() => undefined)
      }
      void focusOnInvalidSubmit(formApi)
      options.onSubmitInvalid?.({ value, formApi })
    },
    canSubmitWhenInvalid: options.canSubmitWhenInvalid ?? true,
  }
  if (options.onSubmitMeta !== undefined) result.onSubmitMeta = options.onSubmitMeta
  if (options.formId !== undefined) result.formId = options.formId
  if (options.asyncAlways !== undefined) result.asyncAlways = options.asyncAlways
  if (options.asyncDebounceMs !== undefined) result.asyncDebounceMs = options.asyncDebounceMs
  if (options.transform !== undefined) result.transform = options.transform
  if (options.defaultState !== undefined) result.defaultState = options.defaultState
  return result
}
