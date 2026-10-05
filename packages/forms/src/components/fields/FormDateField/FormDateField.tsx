import type { FocusEvent } from 'react'
import {
  TextField as UiTextField,
  type TextFieldProps as UiTextFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'
import { formatDate } from '#components/fields/internal/formatTemporal'

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

/**
 * A native date input bound to an ISO date string.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "date",
 *   "name": "travelDate",
 *   "label": "Travel date",
 *   "min": "2026-10-01"
 * }
 * ```
 *
 * @value `string` (`YYYY-MM-DD`)
 * @empty `''`
 *
 * @privateRemarks
 * A native date input bound to an ISO `YYYY-MM-DD` string (§7.2). Empty is `''`.
 */
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
