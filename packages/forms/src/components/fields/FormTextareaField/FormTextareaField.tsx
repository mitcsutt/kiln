import type { FocusEvent } from 'react'
import {
  TextareaField as UiTextareaField,
  type TextareaFieldProps as UiTextareaFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormTextareaFieldProps
  extends Omit<UiTextareaFieldProps, ControlledKeys>, CommonFieldProps<string> {}

/**
 * A multi-line text field bound to a `string` path.
 *
 * @remarks
 * It renders kiln-ui's {@link TextareaField | TextareaField}.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "textarea",
 *   "name": "notes",
 *   "label": "Notes for the crew",
 *   "maxLength": 300,
 *   "showCount": true
 * }
 * ```
 *
 * @value `string`
 * @empty `''`
 *
 * @privateRemarks
 * A multi-line text field bound to a `string` path (§7.2 `textarea`).
 */
export const FormTextareaField = defineField<string>()(function FormTextareaField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormTextareaFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view') return <FieldView label={props.label}>{binding.value}</FieldView>
  return (
    <UiTextareaField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
      value={binding.value ?? ''}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLTextAreaElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
