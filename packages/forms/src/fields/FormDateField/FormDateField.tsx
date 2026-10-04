import type { FocusEvent } from 'react'
import {
  TextField as UiTextField,
  type TextFieldProps as UiTextFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineField } from '#core/kit/contracts'
import { formatDate } from '#core/binding/formatTemporal'

export interface FormDateFieldProps
  extends
    Omit<
      UiTextFieldProps,
      ControlledKeys | 'type' | 'min' | 'max' | 'inputMode' | 'showCount' | 'maxLength'
    >,
    CommonFieldProps<string> {
  /** Earliest value, ISO (YYYY-MM-DD). */
  min?: string
  /** Latest value, ISO (YYYY-MM-DD). */
  max?: string
}

/** A native date input bound to an ISO `YYYY-MM-DD` string (§7.2). Empty is `''`. */
export const FormDateField = defineField<string>()(function FormDateField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormDateFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{formatDate(binding.value)}</FieldView>
  return (
    <UiTextField
      {...props}
      {...binding.fieldProps}
      type="date"
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
