import type { FocusEvent } from 'react'
import {
  DateTimeField as UiDateTimeField,
  TextField as UiTextField,
  type DateTimeFieldProps as UiDateTimeFieldProps,
  type TextFieldProps as UiTextFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { pickerFieldProps } from '#components/fields/internal/pickerProps'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'
import { formatDateTime } from '#components/fields/internal/formatTemporal'

export interface FormDateTimeFieldProps
  extends
    Omit<
      UiTextFieldProps,
      ControlledKeys | 'type' | 'min' | 'max' | 'inputMode' | 'showCount' | 'maxLength'
    >,
    Pick<
      UiDateTimeFieldProps,
      | 'granularity'
      | 'hourCycle'
      | 'isDateDisabled'
      | 'firstDayOfWeek'
      | 'locale'
      | 'clearable'
      | 'labels'
    >,
    CommonFieldProps<string> {
  /** Earliest value, ISO (YYYY-MM-DDTHH:mm). */
  min?: string
  /** Latest value, ISO (YYYY-MM-DDTHH:mm). */
  max?: string
  /**
   * `native`: the platform's own `datetime-local` input. `calendar`: kiln-ui's
   * {@link DateTimeField | DateTimeField}, the date and time typed part by part in the locale's
   * order with a calendar to pick the day from. `segmented`: the same typed parts without the
   * calendar. The value is the same wall-clock ISO date-time whichever you choose.
   * `granularity`, `hourCycle`, `isDateDisabled`, `firstDayOfWeek`, `locale`, `clearable` and
   * `labels` apply to `calendar` and `segmented` only, and the text input's own props (`step`,
   * `placeholder`, `leading`) to `native` only.
   */
  picker?: 'native' | 'calendar' | 'segmented'
}

/**
 * A date and time bound to an ISO string: the platform's date-time input, or kiln-ui's typed date
 * and time with a calendar.
 *
 * @remarks
 * By default it renders kiln-ui's {@link TextField | TextField} with `type="datetime-local"`.
 * `picker="calendar"` swaps in kiln-ui's {@link DateTimeField | DateTimeField}: the same theme in
 * every browser, the parts in the locale's order and on its clock, and a calendar for the day.
 * Either way the value is a wall-clock time with no zone, like `datetime-local`'s.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "dateTime",
 *   "name": "pickup",
 *   "label": "Pick-up time",
 *   "picker": "calendar"
 * }
 * ```
 *
 * @value `string` (`YYYY-MM-DDTHH:mm`)
 * @empty `''`
 *
 * @privateRemarks
 * A native `datetime-local` input bound to an ISO `YYYY-MM-DDTHH:mm` string (§7.2). Empty is
 * `''`. The picker is opt-in (Appendix A.6), so a field without `picker` renders exactly as
 * before. ui `DateTimeField`'s `timeZone` isn't offered: it turns the value into a UTC instant,
 * which this field's value contract and view mode don't describe.
 */
export const FormDateTimeField = defineField<string>()(function FormDateTimeField({
  warn,
  excluded,
  onBlur,
  picker = 'native',
  granularity,
  hourCycle,
  isDateDisabled,
  firstDayOfWeek,
  locale,
  clearable,
  labels,
  ...props
}: FormDateTimeFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{formatDateTime(binding.value)}</FieldView>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
  const value = binding.value ?? ''
  if (picker !== 'native')
    return (
      <UiDateTimeField
        {...pickerFieldProps(props)}
        {...binding.fieldProps}
        ref={binding.ref}
        value={value}
        onValueChange={binding.setValue}
        min={props.min}
        max={props.max}
        granularity={granularity}
        hourCycle={hourCycle}
        isDateDisabled={isDateDisabled}
        firstDayOfWeek={firstDayOfWeek}
        locale={locale}
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
      type="datetime-local"
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
