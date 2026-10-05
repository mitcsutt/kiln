import { useContext, useSyncExternalStore } from 'react'
import type { AnyFormApi } from '@tanstack/react-form'
import type { AnyKitForm, FieldRegistry } from '#core/kit/types'
import { formContext } from '#core/contexts'
import type { NormalisedError } from '#core/binding/errors'
import type { ErrorVisibility } from '#core/binding/visibility'
import { defaultMessages, resolveMessage, type FormMessages } from '#core/runtime/messages'
import { isAtOrUnder } from '#core/runtime/paths'
import type { ScopeHandle } from '#core/scope/FieldScope'

export type { AnyKitForm }

export type ValidateOn = 'blur' | 'change' | 'submit'
export type FocusOnInvalid = 'auto' | 'first-field' | 'summary' | false
export type AfterSubmit = 'rebaseline' | 'reset' | 'keep' | 'lock'
export type InactiveReason = 'disabled' | 'readOnly' | 'excluded' | 'hidden'
export type InactiveSubmit = 'keep' | 'prune'
export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface FormRuntimeOptions {
  errorVisibility: ErrorVisibility
  validateOn: ValidateOn
  focusOnInvalid: FocusOnInvalid
  afterSubmit: AfterSubmit
  /** Display text for a normalised error (after `$key` resolution). */
  formatError: (error: NormalisedError) => string
  messages: FormMessages
}

export interface FieldRegistration {
  id: string
  focus(): void
  getLabel(): string
  scopes: readonly ScopeHandle[]
  element(): HTMLElement | null
}

export interface InactiveEntry {
  reason: InactiveReason
  submit: InactiveSubmit
}

/** A derived-field rule as the runtime stores it (component-mode `derive`, schema `compute`). */
export interface RuntimeDeriveRule {
  field: string
  from: readonly string[]
  compute: (values: unknown) => unknown
}

/** Per-form state that is not form values (§5.1). Not React state: read it with `useRuntimeValue`. */
export interface FormRuntime {
  options: FormRuntimeOptions
  fields: Map<string, FieldRegistration>
  inactive: Map<string, InactiveEntry>
  summary: { mounted: boolean; focus(): void } | null
  formElement: HTMLFormElement | null
  locked: boolean
  /** Autosave status for `FormStatus` (set by `useAutosave`). */
  autosave: AutosaveStatus
  /** Field-level `defaultValue`s seen by bindings (prune uses them before form defaults). */
  fieldDefaults: Map<string, unknown>
  /**
   * The current baseline (new defaults after `rebaseline` / `useServerValues` / autosave), and the
   * user's `defaultValues` it replaced — dropped when the user passes different defaults.
   */
  baseline: { values: unknown; source: unknown } | null
  /** The `defaultValues` the app passed on the latest render. */
  userDefaults: unknown
  /**
   * TanStack's core `FormApi` (set on mount). The React form is a spread copy whose `options`
   * goes stale after `update()`, so anything reading options goes through `coreApi()`.
   */
  core: AnyFormApi | null
  /** Name of the field whose change is being validated right now (set by the kit's change listener). */
  changing: string | null
  /**
   * While true, a `change` validation runs `onDynamic` even before the field's first blur — set
   * only for the duration of `useAutosave`'s pre-save validation pass.
   */
  forceDynamic: boolean
  /**
   * The kit's field registry (set by `useAppForm`), so layouts can bind typed shorthand fields
   * (`bindFields(form, registry, prefix)`). `null` for a form not created by a kit.
   */
  registry: FieldRegistry | null
  /**
   * Derive rules registered at runtime (schema `compute`, §10.6), by owner (a schema object),
   * ref-counted. Read by the same form `onChange` listener as the `derive` option (§6.9): they
   * run when a `from` path changes, never on mount, whether or not the derived field is rendered.
   */
  derive: Map<object, { rules: readonly RuntimeDeriveRule[]; refs: number }>
  /**
   * Each mounted `Repeater`'s new-item value, by array path: pruning a field inside
   * a row uses the row's `newItem` value for it, as a top-level field uses the form defaults.
   */
  itemTemplates: Map<string, () => unknown>
  /** Calls every listener; components re-render only if the slice they read changed. */
  subscribe: (listener: () => void) => () => void
  notify(): void
}

interface InactiveToken {
  names: readonly string[]
  reason: InactiveReason
  submit: InactiveSubmit
}

const tokens = new WeakMap<FormRuntime, Map<symbol, InactiveToken>>()

export function defaultRuntimeOptions(): FormRuntimeOptions {
  return {
    errorVisibility: 'blur',
    validateOn: 'blur',
    focusOnInvalid: 'auto',
    afterSubmit: 'rebaseline',
    formatError: (error) => error.message,
    messages: defaultMessages,
  }
}

export function createFormRuntime(): FormRuntime {
  const listeners = new Set<() => void>()
  const runtime: FormRuntime = {
    options: defaultRuntimeOptions(),
    fields: new Map(),
    inactive: new Map(),
    summary: null,
    formElement: null,
    locked: false,
    autosave: 'idle',
    fieldDefaults: new Map(),
    baseline: null,
    userDefaults: undefined,
    core: null,
    changing: null,
    forceDynamic: false,
    registry: null,
    derive: new Map(),
    itemTemplates: new Map(),
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    notify() {
      for (const listener of [...listeners]) listener()
    },
  }
  return runtime
}

/** The TanStack API of a form the package was given. */
export function toFormApi(form: AnyKitForm): AnyFormApi {
  return form as unknown as AnyFormApi
}

/** The live core `FormApi` of a form (falls back to the object itself before mount). */
export function coreApi(form: AnyKitForm): AnyFormApi {
  return getFormRuntime(form).core ?? toFormApi(form)
}

/** Anything form-like: a FormApi, the React extended form, or a field group (`group.form`). */
interface FormLike {
  store?: unknown
  form?: unknown
  fieldInfo?: unknown
}

function keyOf(form: AnyKitForm): object {
  const like = form as FormLike
  if (like.fieldInfo === undefined && typeof like.form === 'object' && like.form !== null) {
    return keyOf(like.form as AnyKitForm)
  }
  return typeof like.store === 'object' && like.store !== null ? like.store : form
}

const runtimes = new WeakMap<object, FormRuntime>()

/** The runtime of a form (created lazily with defaults for a raw TanStack form). */
export function getFormRuntime(form: AnyKitForm): FormRuntime {
  const key = keyOf(form)
  let runtime = runtimes.get(key)
  if (!runtime) {
    runtime = createFormRuntime()
    runtimes.set(key, runtime)
  }
  return runtime
}

/** Associates a runtime created before the form (by `useAppForm`) with the form. */
export function attachFormRuntime(form: AnyKitForm, runtime: FormRuntime): void {
  const key = keyOf(form)
  if (runtimes.get(key) !== runtime) runtimes.set(key, runtime)
}

/** The runtime of `form`, or of the form in context. */
export function useFormRuntime(form?: AnyKitForm): FormRuntime {
  const resolved = useResolvedForm(form)
  return getFormRuntime(resolved)
}

/** `form` if given, else the form from `<Form>` / `<form.AppForm>` context. */
export function useResolvedForm(form?: AnyKitForm): AnyFormApi {
  const fromContext = useContext(formContext) as AnyFormApi | null
  const resolved = form ? toFormApi(form) : fromContext
  if (!resolved) {
    throw new Error(
      '[@mitcsutt/kiln-forms] No form: pass `form`, or render inside <Form form={form}> / <form.AppForm>.',
    )
  }
  return resolved
}

/**
 * One slice of the runtime (the lock, the autosave status), re-rendering only when it changes.
 * `select` must return a primitive (or a value that is stable while the slice is unchanged).
 */
export function useRuntimeValue<T>(runtime: FormRuntime, select: (runtime: FormRuntime) => T): T {
  const read = () => select(runtime)
  return useSyncExternalStore(runtime.subscribe, read, read)
}

function rebuildInactive(runtime: FormRuntime): void {
  const next = new Map<string, InactiveEntry>()
  for (const token of tokens.get(runtime)?.values() ?? []) {
    for (const name of token.names) {
      const previous = next.get(name)
      // `prune` wins over `keep`: a value that must not be submitted never is.
      if (!previous || (previous.submit === 'keep' && token.submit === 'prune')) {
        next.set(name, { reason: token.reason, submit: token.submit })
      }
    }
  }
  runtime.inactive = next
}

/**
 * Marks paths inactive (§5.4): their validators stop, their errors are cleared, and with
 * `submit: 'prune'` their submitted value becomes the default. Returns an undo function.
 */
export function markInactive(
  form: AnyKitForm,
  names: readonly string[],
  reason: InactiveReason,
  submit: InactiveSubmit,
): () => void {
  const runtime = getFormRuntime(form)
  let map = tokens.get(runtime)
  if (!map) {
    map = new Map()
    tokens.set(runtime, map)
  }
  const token = Symbol(reason)
  map.set(token, { names: [...names], reason, submit })
  rebuildInactive(runtime)
  clearErrors(toFormApi(form), names)
  runtime.notify()
  return () => {
    if (!map.delete(token)) return
    rebuildInactive(runtime)
    runtime.notify()
  }
}

/** Clears every error slot of the given paths (and anything nested under them). */
export function clearErrors(form: AnyFormApi, names: readonly string[]): void {
  const metaNames = Object.keys(form.state.fieldMeta as Record<string, unknown>)
  for (const metaName of metaNames) {
    if (!names.some((name) => isAtOrUnder(metaName, name))) continue
    const meta = form.getFieldMeta(metaName)
    if (!meta) continue
    const hasErrors = Object.values(meta.errorMap as Record<string, unknown>).some(
      (value) => value !== undefined,
    )
    if (!hasErrors) continue
    form.setFieldMeta(metaName, (prev) => ({ ...prev, errorMap: {}, errorSourceMap: {} }))
  }
}

/** Whether `path` (or one of its ancestors) is inactive. */
export function isInactive(runtime: FormRuntime, path: string): boolean {
  if (runtime.inactive.size === 0) return false
  if (runtime.inactive.has(path)) return true
  for (const name of runtime.inactive.keys()) if (isAtOrUnder(path, name)) return true
  return false
}

/** Display text for a normalised error: `$key` messages resolved, then the form's `formatError`. */
export function formatErrorText(runtime: FormRuntime, error: NormalisedError): string {
  const message = resolveMessage(error.message, runtime.options.messages, error.params)
  return runtime.options.formatError({ ...error, message })
}

/**
 * Registers derive rules for `owner` (ref-counted: several renderers of one schema register once).
 * Returns the unregister function.
 */
export function registerDerive(
  form: AnyKitForm,
  owner: object,
  rules: readonly RuntimeDeriveRule[],
): () => void {
  const runtime = getFormRuntime(form)
  const entry = runtime.derive.get(owner)
  if (entry) entry.refs += 1
  else runtime.derive.set(owner, { rules, refs: 1 })
  let active = true
  return () => {
    if (!active) return
    active = false
    const current = runtime.derive.get(owner)
    if (!current) return
    current.refs -= 1
    if (current.refs <= 0) runtime.derive.delete(owner)
  }
}

/** Every derive rule registered at runtime. */
export function runtimeDeriveRules(runtime: FormRuntime): RuntimeDeriveRule[] {
  const out: RuntimeDeriveRule[] = []
  for (const entry of runtime.derive.values()) out.push(...entry.rules)
  return out
}
