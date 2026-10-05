import type { FocusEvent } from 'react'
import {
  NumberField as UiNumberField,
  Numeral,
  type NumberFieldProps as UiNumberFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormNumberFieldProps
  extends Omit<UiNumberFieldProps, ControlledKeys>, CommonFieldProps<number | null> {}

/**
 * A number field bound to a `number` path (§7.2 `number`) — the path may additionally be
 * `null`/`undefined`: clearing the input always emits `null`. View mode formats the value with
 * `Numeral` using the field's own `formatOptions`/`locale`.
 */
export const FormNumberField = defineField<number>()(function FormNumberField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormNumberFieldProps) {
  const binding = useFieldBinding<number | null>({
    ...props,
    warn,
    excluded,
    accepts: accepts.numberOrNull,
    empty: null,
  })
  if (binding.mode === 'view') {
    return (
      <FieldView label={props.label}>
        {binding.value === null ? undefined : (
          <Numeral value={binding.value} format={props.formatOptions} locale={props.locale} />
        )}
      </FieldView>
    )
  }
  return (
    <UiNumberField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      value={binding.value}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
