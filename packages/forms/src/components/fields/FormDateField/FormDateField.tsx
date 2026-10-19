import type { FocusEvent } from 'react'
import {
  DateField as UiDateField,
  TextField as UiTextField,
  type DateFieldProps as UiDateFieldProps,
  type TextFieldProps as UiTextFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { pickerFieldProps } from '#components/fields/internal/pickerProps'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'
import { formatDate } from '#components/fields/internal/formatTemporal'

export interface FormDateFieldProps
  extends
    Omit<
      UiTextFieldProps,
      ControlledKeys | 'type' | 'min' | 'max' | 'inputMode' | 'showCount' | 'maxLength'
    >,
    Pick<
      UiDateFieldProps,
      'isDateDisabled' | 'firstDayOfWeek' | 'locale' | 'timeZone' | 'clearable' | 'labels'
    >,
    CommonFieldProps<string> {
  /** Earliest value, ISO (YYYY-MM-DD). */
  min?: string
  /** Latest value, ISO (YYYY-MM-DD). */
  max?: string
  /**
   * `native`: the platform's own date input. `calendar`: kiln-ui's
   * {@link DateField | DateField}, typed part by part in the locale's order with a calendar to
   * pick from. `segmented`: the same typed parts without the calendar. The value is the same ISO
   * date whichever you choose. `isDateDisabled`, `firstDayOfWeek`, `locale`, `timeZone`,
   * `clearable` and `labels` apply to `calendar` and `segmented` only, and the text input's own
   * props (`placeholder`, `leading`, `autoComplete`) to `native` only.
   */
  picker?: 'native' | 'calendar' | 'segmented'
}

/**
 * A date bound to an ISO date string: the platform's date input, or kiln-ui's typed date with a
 * calendar.
 *
 * @remarks
 * By default it renders kiln-ui's {@link TextField | TextField} with `type="date"`, so the
 * platform's own date picker does the work. `picker="calendar"` swaps in kiln-ui's
 * {@link DateField | DateField} instead: the same theme in every browser, the parts in the
 * locale's order, and days outside `min`/`max` or ruled out by `isDateDisabled` that can't be
 * picked.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "date",
 *   "name": "travelDate",
 *   "label": "Travel date",
 *   "min": "2026-10-01",
 *   "picker": "calendar"
 * }
 * ```
 *
 * @value `string` (`YYYY-MM-DD`)
 * @empty `''`
 *
 * @privateRemarks
 * A native date input bound to an ISO `YYYY-MM-DD` string (§7.2). Empty is `''`. The picker is
 * opt-in (Appendix A.6), so a field without `picker` renders exactly as before.
 */
export const FormDateField = defineField<string>()(function FormDateField({
  warn,
  excluded,
  onBlur,
  picker = 'native',
  isDateDisabled,
  firstDayOfWeek,
  locale,
  timeZone,
  clearable,
  labels,
  ...props
}: FormDateFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{formatDate(binding.value)}</FieldView>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
  const value = binding.value ?? ''
  if (picker !== 'native')
    return (
      <UiDateField
        {...pickerFieldProps(props)}
        {...binding.fieldProps}
        ref={binding.ref}
        value={value}
        onValueChange={binding.setValue}
        min={props.min}
        max={props.max}
        isDateDisabled={isDateDisabled}
        firstDayOfWeek={firstDayOfWeek}
        locale={locale}
        timeZone={timeZone}
        clearable={clearable}
        labels={labels}
        calendar={picker === 'calendar'}
        onBlur={(event) => {
          // The picker blurs from one of its parts, not an `<input>`; the handler only gets the
          // event to forward it.
          onBlur?.(event as FocusEvent<HTMLInputElement>)
          binding.onBlur()
        }}
      />
    )
  return (
    <UiTextField
      {...props}
      {...binding.fieldProps}
      type="date"
      ref={binding.ref}
      value={value}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
