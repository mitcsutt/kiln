import type { FocusEvent } from 'react'
import {
  Numeral,
  RangeSliderField as UiRangeSliderField,
  type RangeSliderFieldProps as UiRangeSliderFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormRangeFieldProps
  extends Omit<UiRangeSliderFieldProps, ControlledKeys>, CommonFieldProps<[number, number]> {}

/**
 * A low–high range on one track (§7.2 `range`). Always has a value (no empty state).
 */
export const FormRangeField = defineField<[number, number]>()(function FormRangeField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormRangeFieldProps) {
  const binding = useFieldBinding<[number, number]>({
    ...props,
    warn,
    excluded,
    accepts: accepts.tuple2,
    empty: [props.min ?? 0, props.max ?? 0],
  })
  if (binding.mode === 'view') {
    return (
      <FieldView label={props.label}>
        <Numeral value={binding.value[0]} format={props.formatOptions} locale={props.locale} />
        {' – '}
        <Numeral value={binding.value[1]} format={props.formatOptions} locale={props.locale} />
      </FieldView>
    )
  }
  return (
    <UiRangeSliderField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      value={binding.value}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLSpanElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
