import type { FocusEvent } from 'react'
import {
  RadioGroupField as UiRadioGroupField,
  type RadioGroupFieldProps as UiRadioGroupFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { useOptionMapping } from '#core/binding/optionValues'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineOptionField, type FieldOption, type Primitive } from '#core/kit/contracts'

export interface FormRadioFieldProps
  extends
    Omit<UiRadioGroupFieldProps, ControlledKeys | 'options'>,
    CommonFieldProps<Primitive | null> {
  /** Typed to the bound path's own value type in the typed shorthand. */
  options?: readonly FieldOption[]
}

/**
 * One choice from a short list, as radios (§7.2 `radio`). Option values keep their primitive
 * type (numbers and booleans round-trip through the string-only ui control, §7.3); empty is `null`.
 */
export const FormRadioField = defineOptionField()(function FormRadioField({
  warn,
  excluded,
  onBlur,
  options,
  ...props
}: FormRadioFieldProps) {
  const binding = useFieldBinding<Primitive | null>({
    ...props,
    warn,
    excluded,
    accepts: accepts.primitiveOrNull,
    empty: null,
  })
  const mapping = useOptionMapping(options)
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{mapping.labelOf(binding.value)}</FieldView>
  return (
    <UiRadioGroupField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      options={mapping.uiOptions}
      value={mapping.toUi(binding.value)}
      onValueChange={(next) => {
        binding.setValue(mapping.fromUi(next))
      }}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
