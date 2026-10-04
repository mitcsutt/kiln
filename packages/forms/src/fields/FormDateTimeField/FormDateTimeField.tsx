import type { FocusEvent } from 'react'
import {
  TextField as UiTextField,
  type TextFieldProps as UiTextFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineField } from '#core/kit/contracts'
import { formatDateTime } from '#core/binding/formatTemporal'

export interface FormDateTimeFieldProps
  extends
    Omit<
      UiTextFieldProps,
      ControlledKeys | 'type' | 'min' | 'max' | 'inputMode' | 'showCount' | 'maxLength'
    >,
    CommonFieldProps<string> {
  /** Earliest value, ISO (YYYY-MM-DDTHH:mm). */
  min?: string
  /** Latest value, ISO (YYYY-MM-DDTHH:mm). */
  max?: string
}

/** A native `datetime-local` input bound to an ISO `YYYY-MM-DDTHH:mm` string (§7.2). Empty is `''`. */
export const FormDateTimeField = defineField<string>()(function FormDateTimeField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormDateTimeFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{formatDateTime(binding.value)}</FieldView>
  return (
    <UiTextField
      {...props}
      {...binding.fieldProps}
      type="datetime-local"
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
