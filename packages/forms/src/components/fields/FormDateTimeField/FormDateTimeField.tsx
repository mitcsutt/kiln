import type { FocusEvent } from 'react'
import {
  TextField as UiTextField,
  type TextFieldProps as UiTextFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'
import { formatDateTime } from '#components/fields/internal/formatTemporal'

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

/**
 * A native date and time input bound to an ISO string.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "dateTime",
 *   "name": "pickup",
 *   "label": "Pick-up time"
 * }
 * ```
 *
 * @value `string` (`YYYY-MM-DDTHH:mm`)
 * @empty `''`
 *
 * @privateRemarks
 * A native `datetime-local` input bound to an ISO `YYYY-MM-DDTHH:mm` string (§7.2). Empty is `''`.
 */
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
