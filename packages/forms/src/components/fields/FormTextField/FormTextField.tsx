import type { FocusEvent } from 'react'
import {
  TextField as UiTextField,
  type TextFieldProps as UiTextFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormTextFieldProps
  extends Omit<UiTextFieldProps, ControlledKeys | 'type'>, CommonFieldProps<string> {
  /** Input mode/autocomplete hint only; validation comes from the schema/rules. Default `text`. */
  type?: 'text' | 'email' | 'tel' | 'url' | 'search'
}

/** A single-line text field bound to a `string` path (§7.2 `text`). */
export const FormTextField = defineField<string>()(function FormTextField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormTextFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view') return <FieldView label={props.label}>{binding.value}</FieldView>
  return (
    <UiTextField
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
