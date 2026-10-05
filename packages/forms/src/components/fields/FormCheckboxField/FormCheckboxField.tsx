import type { FocusEvent } from 'react'
import {
  CheckboxField as UiCheckboxField,
  type CheckboxFieldProps as UiCheckboxFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'
import { getFormRuntime } from '#runtime/formRuntime'

export interface FormCheckboxFieldProps
  extends
    Omit<UiCheckboxFieldProps, ControlledKeys | 'checked' | 'defaultChecked' | 'onCheckedChange'>,
    CommonFieldProps<boolean> {}

/** A single checkbox bound to a `boolean` path (§7.2 `checkbox`). Empty is `false`. */
export const FormCheckboxField = defineField<boolean>()(function FormCheckboxField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormCheckboxFieldProps) {
  const binding = useFieldBinding<boolean>({
    ...props,
    warn,
    excluded,
    accepts: accepts.boolean,
    empty: false,
  })
  if (binding.mode === 'view') {
    const messages = getFormRuntime(binding.api.form).options.messages
    return <FieldView label={props.label}>{binding.value ? messages.yes : messages.no}</FieldView>
  }
  return (
    <UiCheckboxField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      checked={binding.value}
      onCheckedChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLButtonElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
