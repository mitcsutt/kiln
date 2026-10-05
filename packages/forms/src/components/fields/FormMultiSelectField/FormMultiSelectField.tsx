import { useRef, useState, type FocusEvent } from 'react'
import { getBy, useSelector, type AnyFormApi } from '@tanstack/react-form'
import {
  ComboboxField as UiComboboxField,
  type ComboboxFieldMultipleProps as UiComboboxFieldMultipleProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { useOptionMapping } from '#hooks/useOptionMapping'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineOptionsField, type FieldOption } from '#kit/contracts'
import { useOptions, type OptionsLoader } from '#hooks/useOptions'
import { getFormRuntime } from '#runtime/formRuntime'

/** The base value of a multi-select option (§7.2 `multiSelect`: no booleans). */
export type MultiSelectValue = string | number

export interface FormMultiSelectFieldProps
  extends
    Omit<
      UiComboboxFieldMultipleProps,
      ControlledKeys | 'options' | 'multiple' | 'creatable' | 'inputValue' | 'defaultInputValue'
    >,
    CommonFieldProps<readonly MultiSelectValue[]> {
  options?: readonly FieldOption<MultiSelectValue>[]
  /** Async search (§7.4). Pairs with `reloadOn`/`minQueryLength`; implies `filter="none"`. */
  loadOptions?: OptionsLoader<MultiSelectValue>
  /** Sibling field paths whose values reload (and re-key the cache of) `loadOptions`. */
  reloadOn?: readonly string[]
  minQueryLength?: number
}

/**
 * A searchable multiple choice (§7.2 `multiSelect`): the ui combobox in `multiple` mode, chosen
 * values shown as removable chips. Static `options` or async `loadOptions` (`useOptions`); not
 * `creatable` (free text is single-choice only). Empty is `[]`.
 */
export const FormMultiSelectField = defineOptionsField<MultiSelectValue>()(
  function FormMultiSelectField({
    warn,
    excluded,
    onBlur,
    onInputValueChange,
    options,
    loadOptions,
    reloadOn,
    minQueryLength,
    emptyMessage,
    ...props
  }: FormMultiSelectFieldProps) {
    const binding = useFieldBinding<readonly MultiSelectValue[]>({
      ...props,
      warn,
      excluded,
      accepts: accepts.arrayOfPrimitive,
      empty: [],
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
    const result = useOptions<MultiSelectValue>(
      isView ? (options ?? []) : (loadOptions ?? options ?? []),
      {
        query,
        deps,
        values: form.state.values,
        ...(minQueryLength !== undefined ? { minQueryLength } : {}),
      },
    )
    // Every option seen — static `options`, and (edit mode only) whatever `loadOptions` has
    // returned so far — so view mode can show real labels without calling the loader: static
    // beats a stale loader result, which beats the raw value (never "Not provided").
    const knownRef = useRef(new Map<string, FieldOption<MultiSelectValue>>())
    for (const option of result.options) knownRef.current.set(String(option.value), option)
    for (const option of options ?? []) knownRef.current.set(String(option.value), option)

    // An async search replaces `result.options`, so map the selected values through
    // even when the current result doesn't contain them (earlier picks, defaults) — otherwise a
    // pick from the next search would drop them. Their chips keep their labels in the ui control.
    const mapping = useOptionMapping(result.options, {
      retain: binding.value,
      known: knownRef.current,
    })

    if (isView) {
      const labels = binding.value.map(
        (value) => knownRef.current.get(String(value))?.label ?? String(value),
      )
      return (
        <FieldView label={props.label}>
          {labels.length > 0 ? labels.join(', ') : undefined}
        </FieldView>
      )
    }

    const messages = getFormRuntime(form).options.messages

    return (
      <UiComboboxField
        {...props}
        {...binding.fieldProps}
        ref={binding.ref}
        multiple
        options={mapping.uiOptions}
        filter={loadOptions ? 'none' : undefined}
        loading={loadOptions ? result.status === 'loading' : undefined}
        emptyMessage={result.status === 'error' ? messages.optionsFailed : emptyMessage}
        value={binding.value.map(mapping.toUi)}
        onValueChange={(next) => {
          binding.setValue(
            next.map(mapping.fromUi).filter((value): value is MultiSelectValue => value !== null),
          )
        }}
        onInputValueChange={(next) => {
          onInputValueChange?.(next)
          setQuery(next)
        }}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          onBlur?.(event)
          binding.onBlur()
        }}
      />
    )
  },
)
