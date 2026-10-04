import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'
import { Slider, type SliderProps } from '#components/inputs/Slider'

export interface SliderFieldProps
  extends FieldLabelProps, Omit<SliderProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled `Slider`. The thumb is labelled by the Field's label and described by its
 * help, warning and error. `className`/`style` go to the Field; `ref`, `id`, `name` and the
 * rest go to the slider (the ref to its thumb).
 *
 * <SliderField label="Discount rate" name="discountRate" step={5} showValue formatOptions={{ style: 'unit', unit: 'percent' }} />
 */
export const SliderField = forwardRef<HTMLSpanElement, SliderFieldProps>(
  function SliderField(props, ref) {
    const [fieldProps, { id, disabled, className, style, ...sliderProps }] =
      splitFieldLabelProps(props)
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <Slider ref={ref} {...sliderProps} />
      </Field>
    )
  },
)
