import { useMemo, useRef, useState, type FocusEvent } from 'react'
import { getBy, useSelector, type AnyFormApi } from '@tanstack/react-form'
import {
  ComboboxField as UiComboboxField,
  type ComboboxFieldSingleProps as UiComboboxFieldSingleProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { useOptionMapping } from '#hooks/useOptionMapping'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineOptionField, type FieldOption } from '#kit/contracts'
import { useOptions, type OptionsLoader } from '#hooks/useOptions'
import { getFormRuntime } from '#runtime/formRuntime'

/** The base value of a combobox option (§7.2 `combobox`: no booleans — free text is a string). */
export type ComboboxValue = string | number

export interface FormComboboxFieldProps
  extends
    Omit<
      UiComboboxFieldSingleProps,
      ControlledKeys | 'options' | 'multiple' | 'inputValue' | 'defaultInputValue'
    >,
    CommonFieldProps<ComboboxValue | null> {
  options?: readonly FieldOption<ComboboxValue>[]
  /**
   * Async search. Pairs with `reloadOn`/`minQueryLength`; implies `filter="none"`.
   *
   * @privateRemarks Design reference §7.4.
   */
  loadOptions?: OptionsLoader<ComboboxValue>
  /** Sibling field paths whose values reload (and re-key the cache of) `loadOptions`. */
  reloadOn?: readonly string[]
  minQueryLength?: number
}

/**
 * A searchable single choice, from fixed `options` or loaded as you type.
 *
 * @remarks
 * It renders kiln-ui's {@link ComboboxField | ComboboxField}.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "combobox",
 *   "name": "stop",
 *   "label": "Stop",
 *   "optionsFrom": {
 *     "loader": "stops"
 *   }
 * }
 * ```
 *
 * @value the options' value type, or `null`
 * @empty `null`
 *
 * @privateRemarks
 * A searchable single choice (§7.2 `combobox`). Static `options` or async `loadOptions` (debounced,
 * cached, aborts a superseded request — `useOptions`). `creatable` allows free text; the typed
 * value becomes the field value (kept as a string). Empty is `null`.
 */
export const FormComboboxField = defineOptionField<ComboboxValue>()(function FormComboboxField({
  warn,
  excluded,
  onBlur,
  onInputValueChange,
  options,
  loadOptions,
  reloadOn,
  minQueryLength,
  creatable,
  emptyMessage,
  ...props
}: FormComboboxFieldProps) {
  const binding = useFieldBinding<ComboboxValue | null>({
    ...props,
    warn,
    excluded,
    accepts: accepts.primitiveOrNull,
    empty: null,
  })
  const form = binding.api.form as AnyFormApi

  // §7.4 — reload when any `reloadOn` sibling changes; re-key the loader's cache on the same values.
  const reloadOnKey = useSelector(form.store, (state) =>
    reloadOn && reloadOn.length > 0
      ? JSON.stringify(reloadOn.map((name): unknown => getBy(state.values, name)))
      : '',
  )
  const deps =
    reloadOn && reloadOn.length > 0 ? (JSON.parse(reloadOnKey) as readonly unknown[]) : undefined

  const isView = binding.mode === 'view'
  const [query, setQuery] = useState('')
  // View mode never calls the loader (a display-only render must not fire a network request):
  // the source is always the static `options` there, never `loadOptions`.
  const result = useOptions<ComboboxValue>(
    isView ? (options ?? []) : (loadOptions ?? options ?? []),
    {
      query,
      deps,
      values: form.state.values,
      ...(minQueryLength !== undefined ? { minQueryLength } : {}),
    },
  )

  // Every label seen — static `options`, and (edit mode only) whatever `loadOptions` has
  // returned so far — so view mode can show a real value's label without calling the loader:
  // static beats a stale loader result, which beats the raw value (never "Not provided").
  const knownLabelsRef = useRef(new Map<string, string>())
  for (const option of result.options)
    knownLabelsRef.current.set(String(option.value), option.label)
  for (const option of options ?? []) knownLabelsRef.current.set(String(option.value), option.label)

  // As in FormMultiSelectField: keep the chosen value mapped while a search shows
  // other results, so the ui control (and its hidden input) still holds it mid-search.
  const retain = useMemo(() => [binding.value], [binding.value])
  const mapping = useOptionMapping(result.options, { retain })

  // The box writes the chosen option's label back into the input after a pick (known ui
  // behaviour) — that's not a search, so the loader must not be re-queried for it.
  const pickedLabelRef = useRef<string | null>(null)

  if (isView) {
    const value = binding.value
    const label =
      value === null ? undefined : (knownLabelsRef.current.get(String(value)) ?? String(value))
    return <FieldView label={props.label}>{label}</FieldView>
  }

  const messages = getFormRuntime(form).options.messages

  const toUiValue = (value: ComboboxValue | null): string => {
    if (value === null) return ''
    const known = mapping.toUi(value)
    return known !== '' ? known : creatable ? String(value) : ''
  }
  const fromUiValue = (uiValue: string): ComboboxValue | null => {
    const known = mapping.fromUi(uiValue)
    if (known !== null || uiValue === '') return known
    return creatable ? uiValue : null
  }

  return (
    <UiComboboxField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      creatable={creatable}
      options={mapping.uiOptions}
      filter={loadOptions ? 'none' : undefined}
      loading={loadOptions ? result.status === 'loading' : undefined}
      emptyMessage={result.status === 'error' ? messages.optionsFailed : emptyMessage}
      value={toUiValue(binding.value)}
      onValueChange={(next) => {
        if (next === null) {
          pickedLabelRef.current = null
          binding.setValue(null)
          return
        }
        const value = fromUiValue(next)
        pickedLabelRef.current =
          value === null ? null : (mapping.labelOf(value) ?? (creatable ? next : null))
        binding.setValue(value)
      }}
      onInputValueChange={(next) => {
        onInputValueChange?.(next)
        // A pick (click, or Enter on a highlighted option) sets `pickedLabelRef` in
        // `onValueChange` *before* this echo arrives — the common case, handled synchronously.
        if (pickedLabelRef.current !== null) {
          const picked = pickedLabelRef.current
          pickedLabelRef.current = null
          if (next === picked) return
          setQuery(next)
          return
        }
        if (!creatable) {
          setQuery(next)
          return
        }
        // `creatable`'s commit (Enter/blur on typed free text) runs the ui's own
        // `setQuery(label)` *before* `setValues(value)` — the reverse order — so the ref isn't
        // set yet here. Both calls happen in the same synchronous turn (the same keydown/blur
        // handler), so a microtask lets `onValueChange` catch up before deciding. A native
        // Promise microtask, not `queueMicrotask` — vitest's fake timers intercept the latter
        // (it's in their default `toFake` list), tying it to the virtual clock instead of
        // running as soon as the current handler returns. Scoped to `creatable` only: every
        // other call (the vast majority) stays fully synchronous, as before.
        void Promise.resolve().then(() => {
          if (pickedLabelRef.current !== null) {
            const picked = pickedLabelRef.current
            pickedLabelRef.current = null
            if (next === picked) return
          }
          setQuery(next)
        })
      }}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
