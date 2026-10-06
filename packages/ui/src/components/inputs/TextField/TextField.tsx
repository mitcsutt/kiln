import { forwardRef, useId, useState, type ChangeEvent } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { Input, type InputProps } from '#components/inputs/Input'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'
import { FieldCount } from '#components/inputs/internal/messages'

export interface TextFieldProps extends FieldLabelProps, Omit<InputProps, 'invalid'> {
  /** Called with the new string on every change (alongside the native `onChange`). */
  onValueChange?: (value: string) => void
  /**
   * Shows a "12 / 280" character counter under the field (needs `maxLength`). Announced
   * politely only once the remaining count is within 10% of the limit.
   */
  showCount?: boolean
}

/**
 * A labelled text input with description, error, warning and an optional character count.
 *
 * @remarks
 * `TextField` is a {@link Field | Field} around an {@link Input | Input}: the label, description,
 * error and warning wired to the control in one component. Input props (`value`, `type`,
 * `autoComplete`, `leading`, `numeric`) and the ref go to the `<input>`.
 *
 * @privateRemarks
 * Label + Input + description + error in one. Input props (`value`, `type`, `leading`,
 * `numeric`…) and the ref go to the input; `className`/`style` go to the field wrapper.
 *
 * <TextField label="Amount" numeric leading="$" trailing="AUD" error={errors.amount} />
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const {
      id,
      disabled,
      className,
      style,
      onChange,
      onValueChange,
      showCount,
      maxLength,
      ...inputRest
    } = rest
    const autoId = useId()
    const controlId = id ?? `${autoId}control`
    const countId = `${controlId}-count`

    const [internalValue, setInternalValue] = useState(() =>
      typeof inputRest.defaultValue === 'string' ? inputRest.defaultValue : '',
    )
    const currentValue = typeof inputRest.value === 'string' ? inputRest.value : internalValue

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setInternalValue(event.target.value)
      onChange?.(event)
      onValueChange?.(event.target.value)
    }

    const showCounter = showCount === true && maxLength != null
    const remaining = maxLength != null ? maxLength - currentValue.length : 0
    const nearLimit = maxLength != null && remaining <= Math.ceil(maxLength * 0.1)

    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <Input
          ref={ref}
          id={id}
          disabled={disabled}
          maxLength={maxLength}
          onChange={handleChange}
          aria-describedby={showCounter ? countId : undefined}
          {...inputRest}
        />
        {showCounter ? (
          <FieldCount id={countId} live={nearLimit}>
            {currentValue.length} / {maxLength}
          </FieldCount>
        ) : null}
      </Field>
    )
  },
)
