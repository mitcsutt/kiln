import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { AmountInput, type AmountInputProps } from '#components/inputs/AmountInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface AmountFieldProps
  extends FieldLabelProps, Omit<AmountInputProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled money input with the currency's decimals and tabular figures.
 *
 * @remarks
 * `AmountField` is a {@link Field | Field} around an {@link AmountInput | AmountInput}. `currency`
 * is required, and sets the decimal places and the symbol.
 *
 * @privateRemarks
 * Label + AmountInput + description + error. Input props (`currency`, `unit`, `value`…)
 * and the ref go to the text input; `className`/`style` go to the wrapper.
 *
 * <AmountField label="Monthly retainer" currency="GBP" unit="minor" value={retainer} onValueChange={setRetainer} />
 */
export const AmountField = forwardRef<HTMLInputElement, AmountFieldProps>(
  function AmountField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, ...inputRest } = rest
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <AmountInput ref={ref} id={id} disabled={disabled} {...inputRest} />
      </Field>
    )
  },
)
