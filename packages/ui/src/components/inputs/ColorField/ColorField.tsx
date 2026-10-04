import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { ColorInput, type ColorInputProps } from '#components/inputs/ColorInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface ColorFieldProps
  extends FieldLabelProps, Omit<ColorInputProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * Label + ColorInput + description + error. Input props (`value`, `swatches`,
 * `swatchesOnly`…) and the ref go to the hex input (or the swatch group with
 * `swatchesOnly`); `className`/`style` go to the wrapper.
 *
 * <ColorField label="Label colour" swatches={palette} value={colour} onValueChange={setColour} />
 */
export const ColorField = forwardRef<HTMLElement, ColorFieldProps>(function ColorField(props, ref) {
  const [fieldProps, rest] = splitFieldLabelProps(props)
  const { id, disabled, className, style, ...inputRest } = rest
  return (
    <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
      <ColorInput ref={ref} id={id} disabled={disabled} {...inputRest} />
    </Field>
  )
})
