import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'
import { RangeSlider, type RangeSliderProps } from '#components/inputs/RangeSlider'

export interface RangeSliderFieldProps
  extends FieldLabelProps, Omit<RangeSliderProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled range slider, the label naming the group and thumbLabels naming each thumb.
 *
 * @remarks
 * `RangeSliderField` is a {@link Field | Field} around a {@link RangeSlider | RangeSlider}. The
 * label names the group, and `thumbLabels` name the two thumbs.
 *
 * @privateRemarks
 * A labelled `RangeSlider`: the Field's label names the group, `thumbLabels` name the two
 * thumbs. `className`/`style` go to the Field; `ref`, `id`, `name` and the rest go to the
 * range slider's group.
 *
 * <RangeSliderField label="Price range" name="price" min={500} max={5000} step={100} showValue />
 */
export const RangeSliderField = forwardRef<HTMLSpanElement, RangeSliderFieldProps>(
  function RangeSliderField(props, ref) {
    const [fieldProps, { id, disabled, className, style, ...sliderProps }] =
      splitFieldLabelProps(props)
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <RangeSlider ref={ref} {...sliderProps} />
      </Field>
    )
  },
)
