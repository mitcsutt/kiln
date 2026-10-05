import type { FocusEvent } from 'react'
import {
  FileField as UiFileField,
  type FileFieldProps as UiFileFieldProps,
  type FileRejection,
  type FileValue,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineField } from '#core/kit/contracts'
import { getFormRuntime } from '#core/runtime/formRuntime'
import { revealFieldErrors } from '#core/runtime/reveal'

export interface FormFileFieldProps
  extends
    Omit<UiFileFieldProps, ControlledKeys | 'onReject'>,
    CommonFieldProps<readonly FileValue[]> {
  /** Files that weren't added, and why — forwarded after the field's own error is set (§7.3). */
  onReject?: (rejections: readonly FileRejection[]) => void
}

/** File picking bound to a `FileValue[]` path (§7.2 `file`). Empty is `[]`; files aren't uploaded. */
export const FormFileField = defineField<readonly FileValue[]>()(function FormFileField({
  warn,
  excluded,
  onBlur,
  onReject,
  ...props
}: FormFileFieldProps) {
  const binding = useFieldBinding<readonly FileValue[]>({
    ...props,
    warn,
    excluded,
    accepts: accepts.files,
    empty: [],
  })
  if (binding.mode === 'view') {
    const names = binding.value.map((file) => file.name)
    return (
      <FieldView label={props.label}>{names.length > 0 ? names.join(', ') : undefined}</FieldView>
    )
  }
  const messages = getFormRuntime(binding.api.form).options.messages
  return (
    <UiFileField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      value={binding.value}
      onValueChange={(next) => {
        binding.api.setErrorMap({ onChange: undefined })
        binding.setValue(next)
      }}
      onReject={(rejections) => {
        onReject?.(rejections)
        const reason = rejections[0]?.reason
        if (!reason) return
        binding.api.setErrorMap({ onChange: messages.fileRejected[reason] })
        // The rejection answers the user's own pick, so show (and announce) it now
        // under any visibility policy, not when focus later leaves the control.
        revealFieldErrors(binding.api.form, [binding.name])
      }}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
