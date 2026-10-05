import { useCallback, useEffect, useId, useRef, type RefCallback } from 'react'
import { useSelector, type AnyFieldApi, type AnyFormApi } from '@tanstack/react-form'
import { useFieldContext } from '#core/contexts'
import { isDev, useIsomorphicLayoutEffect } from '#core/env'
import { pickErrors } from '#core/binding/errors'
import type { FieldLayout } from '@mitcsutt/kiln-ui'
import { useFieldPresentation } from '#core/binding/presentation'
import { isErrorVisible } from '#core/binding/visibility'
import { focusTarget } from '#core/runtime/focus'
import {
  formatErrorText,
  getFormRuntime,
  markInactive,
  type FieldRegistration,
} from '#core/runtime/formRuntime'
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

/** Text of a label-like element, minus `aria-hidden` marks (required stars, spinners). */
function labelText(element: Element): string {
  const clone = element.cloneNode(true) as HTMLElement
  for (const hidden of clone.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return clone.textContent.replace(/\s+/g, ' ').trim()
}

/** The legend of a `<fieldset>` (its own, not a nested one's). */
function legendOf(fieldset: Element): Element | null {
  for (const child of fieldset.children) if (child.tagName === 'LEGEND') return child
  return null
}

/** The element's own name source: `aria-labelledby`, `${id}-label`, `label[for]` or `labels`. */
function ownLabel(control: HTMLElement): Element | null {
  const doc = control.ownerDocument
  const labelledBy = control.getAttribute('aria-labelledby')
  if (labelledBy) {
    const first = labelledBy
      .split(/\s+/)
      .map((ref) => doc.getElementById(ref))
      .find((el) => el !== null)
    if (first) return first
  }
  if (control.id) {
    const byId = doc.getElementById(`${control.id}-label`)
    if (byId) return byId
  }
  const labels = (control as HTMLInputElement).labels
  if (labels && labels.length > 0) return labels[0] ?? null
  if (control.id)
    return (
      [...doc.querySelectorAll('label')].find((element) => element.htmlFor === control.id) ?? null
    )
  return null
}

/**
 * Visible label text of a field (ErrorSummary links), read from the DOM so it is
 * whatever the user sees. Group fields are named by their `<fieldset>`'s legend:
 * - the field's root (the nearest ancestor-or-self carrying `data-field={name}`) is itself a
 *   fieldset (DateRange: the control is an inner "Start date" input) → that legend;
 * - the control has no name of its own (a radiogroup/group inside a Fieldset) → the nearest
 *   enclosing fieldset's legend;
 * - otherwise the control's own label. Falls back to `fallback` (the path).
 */
function readLabel(control: HTMLElement | null, name: string, fallback: string): string {
  if (!control) return fallback
  let root: HTMLElement | null = control
  while (root && root.getAttribute('data-field') !== name) root = root.parentElement
  const source =
    (root?.tagName === 'FIELDSET' ? legendOf(root) : null) ??
    ownLabel(control) ??
    (() => {
      const fieldset = control.closest('fieldset')
      return fieldset ? legendOf(fieldset) : null
    })()
  if (!source) return fallback
  const text = labelText(source)
  return text === '' ? fallback : text
}

function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter((id): id is string => typeof id === 'string' && id !== '').join(' ')
  return joined === '' ? undefined : joined
}

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
  // One primitive selector: bit 1 = the form was submitted, bit 2 = this field's errors were
  // revealed (a step's Next, a rejected file) — both make its errors visible under any policy;
  // bit 4 = that reveal was a quiet scoped attempt (no per-field alert, like a submit).
  const attempt = useSelector(form.store, (state) => {
    const fieldMeta = (state.fieldMeta as Record<string, unknown>)[name]
    return (
      (state.submissionAttempts > 0 ? 1 : 0) |
      (isRevealedMeta(fieldMeta) ? 2 : 0) |
      (isQuietMeta(fieldMeta) ? 4 : 0)
    )
  })
  const submitted = (attempt & 1) === 1
  const revealed = (attempt & 2) === 2
  const quietReveal = (attempt & 4) === 4

  const mode = presentation.mode ?? 'edit'
  const disabled = presentation.disabled === true || options.disabled === true
  const readOnly = presentation.readOnly === true || options.readOnly === true
  const excluded = Boolean(options.excluded)
  const inactive = disabled || readOnly || excluded
  const reason = disabled ? 'disabled' : readOnly ? 'readOnly' : 'excluded'

  // §4.2.8 — inactive paths: validators gated, errors cleared, excluded values pruned on submit.
  // A view-mode copy (FormReview, `Form mode="view"`) has no side effects on the real field.
  useIsomorphicLayoutEffect(() => {
    if (!inactive || mode === 'view') return undefined
    return markInactive(form, [name], reason, excluded ? 'prune' : 'keep')
  }, [form, name, inactive, reason, excluded, mode])

  // §4.2.10 — focus registration (+ every ancestor scope). A view-mode copy never registers: it
  // has no control, and registering would take over the real field's focus entry and put the
  // name into the review's scopes (counts, step validation).
  const elementRef = useRef<HTMLElement | null>(null)
  const ref = useCallback<RefCallback<HTMLElement>>((element) => {
    elementRef.current = element
  }, [])
  useIsomorphicLayoutEffect(() => {
    const fieldDefault: unknown = api.options.defaultValue
    if (fieldDefault !== undefined) runtime.fieldDefaults.set(name, fieldDefault)
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
        readLabel(
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
  }, [runtime, name, id, scopeNode, api, mode])

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

  const setValue = useCallback(
    (next: V) => {
      if (disabled || readOnly) return
      api.handleChange(next)
    },
    [api, disabled, readOnly],
  )
  const onBlur = useCallback(() => {
    api.handleBlur()
  }, [api])

  // §4.2.3–6 — one visible message per field, warnings under the same policy.
  const errorMap = meta.errorMap as Record<string, unknown>
  const first = pickErrors(errorMap)[0]
  const visible = revealed || isErrorVisible(runtime.options.errorVisibility, meta, submitted)
  const showError = mode === 'edit' && !inactive && first !== undefined && visible
  const errorText = showError ? formatErrorText(runtime, first) : undefined
  const warningText =
    mode === 'edit' && !showError && visible ? (options.warn?.(value) ?? undefined) : undefined
  const warning = warningText === '' ? undefined : warningText

  const external = presentation.errorPlacement === 'external'
  const layout = options.layout ?? presentation.layout
  const labelHidden = options.labelHidden ?? presentation.labelHidden
  const describedBy = joinIds(
    options['aria-describedby'],
    external ? presentation.describedBy?.(name) : undefined,
  )

  // §11.4 — inline errors announce as they appear, except after a submit or a scoped attempt
  // (Next): those announce once themselves and move focus, so N alerts at once would bury it.
  const fieldProps: BoundFieldProps = {
    id,
    name,
    'data-field': name,
    errorLive: !submitted && !quietReveal,
  }
  if (errorText !== undefined) fieldProps.error = errorText === '' ? true : errorText
  if (external) fieldProps.errorHidden = true
  if (warning !== undefined) fieldProps.warning = warning
  if (options.required !== undefined) fieldProps.required = options.required
  if (disabled) fieldProps.disabled = true
  if (readOnly) fieldProps.readOnly = true
  if (meta.isValidating) fieldProps.validating = true
  if (layout !== undefined) fieldProps.layout = layout
  if (labelHidden !== undefined) fieldProps.labelHidden = labelHidden
  if (describedBy !== undefined) fieldProps['aria-describedby'] = describedBy

  const state: FieldBinding<V>['state'] = {
    showError,
    isValidating: meta.isValidating,
    isDirty: !meta.isDefaultValue,
    inactive,
  }
  if (errorText !== undefined) state.error = errorText
  if (warning !== undefined) state.warning = warning

  return { api, name, id, value, setValue, onBlur, ref, mode, state, fieldProps }
}
