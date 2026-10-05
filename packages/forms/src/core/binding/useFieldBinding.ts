import { useCallback, useEffect, useId, useRef, type RefCallback } from 'react'
import { useSelector, type AnyFieldApi, type AnyFormApi } from '@tanstack/react-form'
import type { FieldLayout } from '@mitcsutt/kiln-ui'
import { useFieldContext } from '#core/contexts'
import { isDev, useIsomorphicLayoutEffect } from '#core/env'
import { useFieldPresentation } from '#core/binding/presentation'
import { fieldDisplay } from '#core/runtime/fieldDisplay'
import { focusTarget } from '#core/runtime/focus'
import { getFormRuntime, markInactive, type FieldRegistration } from '#core/runtime/formRuntime'
import { readFieldLabel } from '#core/runtime/labels'
import { isQuietMeta, isRevealedMeta } from '#core/runtime/reveal'
import { scopeChain, useScopeNode } from '#core/scope/FieldScope'

export { accepts } from '#core/binding/accepts'

export interface CommonFieldProps<V> {
  /** Non-blocking advice shown in the warning channel (never blocks submit). */
  warn?: (value: V) => string | null | undefined
  /** Visible but excluded: skips validation, clears its errors, submits its default value. */
  excluded?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
}

export interface FieldBindingOptions<V> extends CommonFieldProps<V> {
  /** Dev-only guard for canonical `field.X` use, where TS cannot check the value type. */
  accepts: (value: unknown) => boolean
  /** Value this field writes when cleared ('' | null | [] | false). Used by rules like `required`. */
  empty: V
  /** The field's own layout; wins over a surrounding `FieldPresentation`. */
  layout?: FieldLayout
  /** The field's own `labelHidden`; wins over a surrounding `FieldPresentation`. */
  labelHidden?: boolean
  /** Extra ids to describe the control, merged with an external error id. */
  'aria-describedby'?: string
}

/** Exactly the `@mitcsutt/kiln-ui` FieldLabelProps additions (§8.1) + wiring. Undefined keys are omitted. */
export interface BoundFieldProps {
  id: string
  name: string
  'data-field': string
  error?: string | true
  errorLive: boolean
  errorHidden?: boolean
  warning?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  validating?: boolean
  layout?: FieldLayout
  labelHidden?: boolean
  'aria-describedby'?: string
}

export interface FieldBinding<V> {
  /** Raw TanStack FieldApi — the escape hatch (value typed via `value`/`setValue`). */
  api: AnyFieldApi
  /** TanStack path, also the native `name` (bracket syntax, FormData-compatible). */
  name: string
  /** `useId()`-based control id (never derived from name). */
  id: string
  value: V
  /** `field.handleChange`; a no-op while readOnly/disabled. */
  setValue: (next: V) => void
  /** `field.handleBlur`. */
  onBlur: () => void
  /** Registers the focus target (the control element). */
  ref: RefCallback<HTMLElement>
  mode: 'edit' | 'view'
  state: {
    showError: boolean
    /** First visible error, formatted. */
    error?: string
    warning?: string
    isValidating: boolean
    /** `!isDefaultValue`. */
    isDirty: boolean
    /** disabled | readOnly | excluded. */
    inactive: boolean
  }
  /** Spread onto the @mitcsutt/kiln-ui *Field component. */
  fieldProps: BoundFieldProps
}

function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter((id): id is string => typeof id === 'string' && id !== '').join(' ')
  return joined === '' ? undefined : joined
}

/** `props` without its `undefined` entries: bound props and state omit unset keys (§4.1). */
function defined<T extends object>(props: { [K in keyof T]: T[K] | undefined }): T {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as T
}

// The field's submit-attempt state, packed into one primitive so its selector re-renders the field
// only when a bit flips: the form was submitted; this field's errors were revealed (a step's
// Next, a rejected file); that reveal was quiet (no per-field alert, like a submit).
const SUBMITTED = 1
const REVEALED = 2
const QUIET = 4

/**
 * THE binding hook (§4): ids, error visibility + normalisation, warnings, disabled/readOnly/excluded
 * semantics, focus registration and view mode, for the field in context.
 */
export function useFieldBinding<V>(options: FieldBindingOptions<V>): FieldBinding<V> {
  const api = useFieldContext<V>() as AnyFieldApi
  const form = api.form as AnyFormApi
  const runtime = getFormRuntime(form)
  const presentation = useFieldPresentation()
  const scopeNode = useScopeNode()
  const id = useId()
  // TanStack types a field's name as `any`; it is always the field's path.
  const name = api.name as string
  const value = api.state.value as V
  const meta = api.state.meta
  const attempt = useSelector(form.store, (state) => {
    const fieldMeta = (state.fieldMeta as Record<string, unknown>)[name]
    return (
      (state.submissionAttempts > 0 ? SUBMITTED : 0) |
      (isRevealedMeta(fieldMeta) ? REVEALED : 0) |
      (isQuietMeta(fieldMeta) ? QUIET : 0)
    )
  })

  const mode = presentation.mode ?? 'edit'
  const disabled = presentation.disabled === true || options.disabled === true
  const readOnly = presentation.readOnly === true || options.readOnly === true
  const excluded = options.excluded === true
  const inactive = disabled || readOnly || excluded
  const reason = disabled ? 'disabled' : readOnly ? 'readOnly' : 'excluded'

  // §4.2.8 — inactive paths: validators gated, errors cleared, excluded values pruned on submit.
  // A view-mode copy (FormReview, `Form mode="view"`) has no side effects on the real field.
  useIsomorphicLayoutEffect(() => {
    if (!inactive || mode === 'view') return undefined
    return markInactive(form, [name], reason, excluded ? 'prune' : 'keep')
  }, [form, name, inactive, reason, excluded, mode])

  // The field-level default, which pruning and `When`'s reset use before the form's.
  const fieldDefault: unknown = api.options.defaultValue
  useIsomorphicLayoutEffect(() => {
    if (fieldDefault !== undefined) runtime.fieldDefaults.set(name, fieldDefault)
  }, [runtime, name, fieldDefault])

  // §4.2.10 — focus registration (+ every ancestor scope), once per mount. A view-mode copy never
  // registers: it has no control, and registering would take over the real field's focus entry
  // and put the name into the review's scopes (counts, step validation).
  const elementRef = useRef<HTMLElement | null>(null)
  const ref = useCallback<RefCallback<HTMLElement>>((element) => {
    elementRef.current = element
  }, [])
  useIsomorphicLayoutEffect(() => {
    if (mode === 'view') return undefined
    const chain = scopeChain(scopeNode)
    const unregister = chain.map((scope) => scope.register(name))
    const element = () =>
      elementRef.current ?? (typeof document === 'undefined' ? null : document.getElementById(id))
    const entry: FieldRegistration = {
      id,
      element,
      scopes: chain,
      focus: () => {
        const current = element()
        if (current) focusTarget(current)?.focus()
      },
      getLabel: () =>
        readFieldLabel(
          typeof document === 'undefined'
            ? null
            : (document.getElementById(id) ?? elementRef.current),
          name,
          name,
        ),
    }
    runtime.fields.set(name, entry)
    return () => {
      for (const done of unregister) done()
      if (runtime.fields.get(name) === entry) runtime.fields.delete(name)
    }
  }, [runtime, name, id, scopeNode, mode])

  // §4.2.12 — dev guard for the canonical path, once per field.
  const warned = useRef(false)
  const accept = options.accepts
  useEffect(() => {
    if (warned.current || !isDev() || accept(value)) return
    warned.current = true
    console.error(
      `[@mitcsutt/kiln-forms] Field "${name}" holds ${JSON.stringify(value)}, which this field component can't edit. ` +
        'Bind a field component whose value type matches (see the value contracts in the forms docs).',
    )
  }, [accept, value, name])

  // The FieldApi's handlers are stable for its lifetime; `api` itself is a new object per change.
  const { handleChange, handleBlur } = api
  const setValue = useCallback(
    (next: V) => {
      if (disabled || readOnly) return
      handleChange(next)
    },
    [handleChange, disabled, readOnly],
  )
  const onBlur = useCallback(() => {
    handleBlur()
  }, [handleBlur])

  const warn = options.warn
  const display = fieldDisplay(runtime, {
    mode,
    inactive,
    meta,
    submitted: (attempt & SUBMITTED) !== 0,
    revealed: (attempt & REVEALED) !== 0,
    quiet: (attempt & QUIET) !== 0,
    warning: warn ? () => warn(value) : undefined,
  })
  const external = presentation.errorPlacement === 'external'

  const fieldProps = defined<BoundFieldProps>({
    id,
    name,
    'data-field': name,
    error: display.error === '' ? true : display.error,
    errorLive: display.errorLive,
    errorHidden: external || undefined,
    warning: display.warning,
    required: options.required,
    disabled: disabled || undefined,
    readOnly: readOnly || undefined,
    validating: meta.isValidating || undefined,
    layout: options.layout ?? presentation.layout,
    labelHidden: options.labelHidden ?? presentation.labelHidden,
    'aria-describedby': joinIds(
      options['aria-describedby'],
      external ? presentation.describedBy?.(name) : undefined,
    ),
  })
  const state = defined<FieldBinding<V>['state']>({
    showError: display.showError,
    error: display.error,
    warning: display.warning,
    isValidating: meta.isValidating,
    isDirty: !meta.isDefaultValue,
    inactive,
  })

  return { api, name, id, value, setValue, onBlur, ref, mode, state, fieldProps }
}
