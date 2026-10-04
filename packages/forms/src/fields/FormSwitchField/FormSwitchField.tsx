import type { FocusEvent } from 'react'
import {
  SwitchField as UiSwitchField,
  type SwitchFieldProps as UiSwitchFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineField } from '#core/kit/contracts'
import { getFormRuntime } from '#core/runtime/formRuntime'

export interface FormSwitchFieldProps
  extends
    Omit<UiSwitchFieldProps, ControlledKeys | 'checked' | 'defaultChecked' | 'onCheckedChange'>,
    CommonFieldProps<boolean> {}

/** A settings-row switch bound to a `boolean` path (§7.2 `switch`). Empty is `false`. */
export const FormSwitchField = defineField<boolean>()(function FormSwitchField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormSwitchFieldProps) {
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
    <UiSwitchField
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
