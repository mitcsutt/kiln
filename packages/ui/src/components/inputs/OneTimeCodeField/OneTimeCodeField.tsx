import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { OneTimeCodeInput, type OneTimeCodeInputProps } from '#components/inputs/OneTimeCodeInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface OneTimeCodeFieldProps
  extends FieldLabelProps, Omit<OneTimeCodeInputProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * Label + OneTimeCodeInput + description + error. The label names the group of cells
 * (and clicking it focuses the first); `className`/`style` go to the wrapper, the ref to
 * the group.
 *
 * <OneTimeCodeField label="Verification code" description="Sent to 0412 345 678" onComplete={verify} />
 */
export const OneTimeCodeField = forwardRef<HTMLDivElement, OneTimeCodeFieldProps>(
  function OneTimeCodeField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, ...inputRest } = rest
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <OneTimeCodeInput ref={ref} id={id} disabled={disabled} {...inputRest} />
      </Field>
    )
  },
)
