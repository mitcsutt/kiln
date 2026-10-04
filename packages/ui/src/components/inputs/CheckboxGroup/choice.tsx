import {
  useCallback,
  useState,
  type FocusEvent,
  type FocusEventHandler,
  type ReactNode,
} from 'react'
import type { FieldLabelProps } from '#components/inputs/Field'
import type { FieldsetProps } from '#components/inputs/Fieldset'
import { useLatest } from '#components/inputs/internal/useLatest'

/*
 * Shared plumbing for the choice controls (CheckboxGroup, ChoiceCards, ChipGroup, Rating,
 * Slider…). Internal — not exported from the package; import via
 * `#components/inputs/CheckboxGroup/choice`.
 */

/** One option in a choice control. `value` is always a string (Radix items are string-keyed). */
export interface ChoiceOption {
  value: string
  label: ReactNode
  /** Secondary line, linked to the option with `aria-describedby`. */
  description?: ReactNode
  disabled?: boolean
}

/**
 * Controlled/uncontrolled state in one hook. `value === undefined` means uncontrolled
 * (so `null` is a real controlled value). With `readOnly`, `set` is a no-op: the control
 * stays focusable but its value never moves.
 */
export function useControllableValue<T>(
  value: T | undefined,
  defaultValue: T,
  onValueChange: ((next: T) => void) | undefined,
  readOnly = false,
): [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : uncontrolled
  const onChangeRef = useLatest(onValueChange)
  const set = useCallback(
    (next: T) => {
      if (readOnly) return
      if (!controlled) setUncontrolled(next)
      onChangeRef.current?.(next)
    },
    [controlled, readOnly, onChangeRef],
  )
  return [current, set]
}

/**
 * Wrap a group's `onBlur` so it fires once, when focus leaves the whole group — not on
 * every hop between its options (React's `onBlur` bubbles like `focusout`).
 */
export function useFocusLeave<E extends HTMLElement>(
  onBlur: FocusEventHandler<E> | undefined,
): FocusEventHandler<E> | undefined {
  return useCallback(
    (event: FocusEvent<E>) => {
      const next = event.relatedTarget
      if (next instanceof Node && event.currentTarget.contains(next)) return
      onBlur?.(event)
    },
    [onBlur],
  )
}

/**
 * One `<input type="hidden">` per value, so a native form submit / FormData sees them.
 * `disabled` disables them too: a disabled control submits nothing.
 */
export function hiddenInputs(
  name: string | undefined,
  values: readonly string[],
  disabled = false,
): ReactNode {
  if (!name) return null
  return values.map((v) => (
    <input key={v} type="hidden" name={name} value={v} disabled={disabled || undefined} />
  ))
}

/**
 * Map a group field's `FieldLabelProps` onto `<Fieldset>`: `label` → `legend`,
 * `labelHidden` → `legendHidden`, `hint` → `description`; `layout` passes straight through
 * (`inline` hides the legend inside Fieldset).
 */
export function toFieldsetProps({
  label,
  description,
  hint,
  labelHidden,
  layout,
  ...rest
}: FieldLabelProps): Omit<FieldsetProps, 'children'> {
  return {
    ...rest,
    legend: label,
    description: description ?? hint,
    legendHidden: labelHidden === true,
    layout,
  }
}
