import type { FocusEvent } from 'react'
import {
  Numeral,
  SliderField as UiSliderField,
  type SliderFieldProps as UiSliderFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineField } from '#core/kit/contracts'

export interface FormSliderFieldProps
  extends Omit<UiSliderFieldProps, ControlledKeys>, CommonFieldProps<number> {}

/**
 * One number from a continuous range (§7.2 `slider`). Always has a value (no empty state);
 * clearing is not a concept a continuous control has.
 */
export const FormSliderField = defineField<number>()(function FormSliderField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormSliderFieldProps) {
  const binding = useFieldBinding<number>({
    ...props,
    warn,
    excluded,
    accepts: accepts.numberOrNull,
    empty: props.min ?? 0,
  })
  if (binding.mode === 'view') {
    return (
      <FieldView label={props.label}>
        <Numeral value={binding.value} format={props.formatOptions} locale={props.locale} />
      </FieldView>
    )
  }
  return (
    <UiSliderField
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
