import type { FocusEvent } from 'react'
import {
  DateRangeField as UiDateRangeField,
  type DateRangeFieldProps as UiDateRangeFieldProps,
  type DateRangeValue,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { formatDate } from '#core/binding/formatTemporal'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineField } from '#core/kit/contracts'

export interface FormDateRangeFieldProps
  extends Omit<UiDateRangeFieldProps, ControlledKeys>, CommonFieldProps<DateRangeValue> {}

const EMPTY: DateRangeValue = { start: '', end: '' }

/**
 * Two ISO dates bound to a `{ start, end }` path (§7.2 `dateRange`). Empty is `{ start: '', end:
 * '' }`. View mode formats each side with `formatDate` and joins them with an en dash.
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
    const parts = [formatDate(value.start), formatDate(value.end)].filter((part) => part !== '')
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
