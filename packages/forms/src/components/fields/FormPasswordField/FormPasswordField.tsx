import type { FocusEvent } from 'react'
import {
  PasswordField as UiPasswordField,
  type PasswordFieldProps as UiPasswordFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormPasswordFieldProps
  extends Omit<UiPasswordFieldProps, ControlledKeys>, CommonFieldProps<string> {}

/**
 * A password field bound to a `string` path (§7.2 `password`). Empty is `''`. View mode never
 * shows the password text — a fixed-length mask, so the view doesn't leak its length either.
 */
export const FormPasswordField = defineField<string>()(function FormPasswordField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormPasswordFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{binding.value ? '••••••••' : undefined}</FieldView>
  return (
    <UiPasswordField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
      value={binding.value ?? ''}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
