import type { FocusEvent } from 'react'
import {
  DateRangeField as UiDateRangeField,
  type DateRangeFieldProps as UiDateRangeFieldProps,
  type DateRangeValue,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { formatDate, formatDateTimeIn } from '#components/fields/internal/formatTemporal'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormDateRangeFieldProps
  extends Omit<UiDateRangeFieldProps, ControlledKeys>, CommonFieldProps<DateRangeValue> {}

const EMPTY: DateRangeValue = { start: '', end: '' }

/** One end for reading: a date, or with a time `granularity` a date and time on `timeZone`'s clock. */
const formatEnd = (value: string, timeZone: string | undefined): string =>
  value.includes('T') ? formatDateTimeIn(value, timeZone) : formatDate(value)

/**
 * Two ISO dates bound to a `{ start, end }` path.
 *
 * @remarks
 * It renders kiln-ui's {@link DateRangeField | DateRangeField}: two native date inputs by default.
 * `picker="calendar"` types each end part by part and opens one two-month calendar for the whole
 * range, `presets` lists ranges such as "Last 7 days" beside it, and `granularity="minute"` gives
 * each end a time. Either of the last two turns the calendar on by itself.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "dateRange",
 *   "name": "trip",
 *   "label": "Travel dates",
 *   "startLabel": "First day",
 *   "endLabel": "Last day",
 *   "picker": "calendar"
 * }
 * ```
 *
 * @value `{ start: string; end: string }`
 * @empty `{ start: '', end: '' }`
 *
 * @privateRemarks
 * Two ISO dates bound to a `{ start, end }` path (§7.2 `dateRange`). Empty is `{ start: '', end:
 * '' }`. View mode formats each side with `formatDate` (or, for an end with a time,
 * `formatDateTimeIn` on the field's `timeZone`) and joins them with an en dash. Every ui prop,
 * the calendar picker's included, passes straight through (Appendix A.6).
 */
export const FormDateRangeField = defineField<DateRangeValue>()(function FormDateRangeField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormDateRangeFieldProps) {
  const binding = useFieldBinding<DateRangeValue>({
    ...props,
    warn,
    excluded,
    accepts: accepts.dateRange,
    empty: EMPTY,
  })
  if (binding.mode === 'view') {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
    const value = binding.value ?? EMPTY
    const parts = [
      formatEnd(value.start, props.timeZone),
      formatEnd(value.end, props.timeZone),
    ].filter((part) => part !== '')
    return (
      <FieldView label={props.label}>
        {parts.length === 0 ? undefined : parts.join(' – ')}
      </FieldView>
    )
  }
  return (
    <UiDateRangeField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
      value={binding.value ?? EMPTY}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLFieldSetElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
