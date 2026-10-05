import type { FocusEvent } from 'react'
import {
  TextField as UiTextField,
  type TextFieldProps as UiTextFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'
import { formatTime } from '#components/fields/internal/formatTemporal'

export interface FormTimeFieldProps
  extends
    Omit<
      UiTextFieldProps,
      ControlledKeys | 'type' | 'min' | 'max' | 'inputMode' | 'showCount' | 'maxLength'
    >,
    CommonFieldProps<string> {
  /** Earliest value, ISO (HH:mm). */
  min?: string
  /** Latest value, ISO (HH:mm). */
  max?: string
}

/** A native time input bound to an ISO `HH:mm` string (§7.2). Empty is `''`. */
export const FormTimeField = defineField<string>()(function FormTimeField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormTimeFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{formatTime(binding.value)}</FieldView>
  return (
    <UiTextField
      {...props}
      {...binding.fieldProps}
      type="time"
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
