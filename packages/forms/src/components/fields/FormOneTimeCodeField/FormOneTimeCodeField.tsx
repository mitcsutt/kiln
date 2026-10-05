import type { FocusEvent } from 'react'
import {
  OneTimeCodeField as UiOneTimeCodeField,
  type OneTimeCodeFieldProps as UiOneTimeCodeFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormOneTimeCodeFieldProps
  extends Omit<UiOneTimeCodeFieldProps, ControlledKeys>, CommonFieldProps<string> {
  /** Once every cell is filled (`onComplete`), also submit the form (§7.3). */
  submitOnComplete?: boolean
}

/** A one-time code bound to a `string` path (§7.2 `oneTimeCode`). Empty is `''`. */
export const FormOneTimeCodeField = defineField<string>()(function FormOneTimeCodeField({
  warn,
  excluded,
  onBlur,
  onComplete,
  submitOnComplete,
  ...props
}: FormOneTimeCodeFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{binding.value || undefined}</FieldView>
  return (
    <UiOneTimeCodeField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
      value={binding.value ?? ''}
      onValueChange={binding.setValue}
      onComplete={(value) => {
        onComplete?.(value)
        if (submitOnComplete) void binding.api.form.handleSubmit()
      }}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
