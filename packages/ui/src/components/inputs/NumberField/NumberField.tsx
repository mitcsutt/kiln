import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { NumberInput, type NumberInputProps } from '#components/inputs/NumberInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface NumberFieldProps
  extends FieldLabelProps, Omit<NumberInputProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * Label + NumberInput + description + error. Input props (`value`, `min`, `step`,
 * `formatOptions`…) and the ref go to the spinbutton; `className`/`style` go to the wrapper.
 *
 * <NumberField label="Guests" min={1} max={12} value={guests} onValueChange={setGuests} />
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, ...inputRest } = rest
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <NumberInput ref={ref} id={id} disabled={disabled} {...inputRest} />
      </Field>
    )
  },
)
