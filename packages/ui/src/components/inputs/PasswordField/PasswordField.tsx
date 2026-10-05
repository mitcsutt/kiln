import { forwardRef, type ChangeEvent } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { PasswordInput, type PasswordInputProps } from '#components/inputs/PasswordInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface PasswordFieldProps
  extends FieldLabelProps, Omit<PasswordInputProps, 'invalid' | keyof FieldLabelProps> {
  /** Called with the new string on every change (alongside the native `onChange`). */
  onValueChange?: (value: string) => void
}

/**
 * A labelled password input with a show and hide toggle.
 *
 * @remarks
 * `PasswordField` is a {@link Field | Field} around a {@link PasswordInput | PasswordInput}.
 * `autoComplete` is required: `current-password` to sign in, `new-password` to set one.
 *
 * @privateRemarks
 * Label + PasswordInput + description + error. Input props (`autoComplete`, `value`,
 * `visible`…) and the ref go to the input; `className`/`style` go to the wrapper.
 *
 * <PasswordField label="New password" autoComplete="new-password" description="At least 12 characters" />
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, onChange, onValueChange, ...inputRest } = rest
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event)
      onValueChange?.(event.target.value)
    }
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <PasswordInput
          ref={ref}
          id={id}
          disabled={disabled}
          onChange={handleChange}
          {...inputRest}
        />
      </Field>
    )
  },
)
