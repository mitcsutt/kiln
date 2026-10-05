import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'
import { Rating, type RatingProps } from '#components/inputs/Rating'

export interface RatingFieldProps
  extends FieldLabelProps, Omit<RatingProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled `Rating`. The stars' radiogroup is labelled by the Field's label and described
 * by its help, warning and error. `className`/`style` go to the Field; `ref`, `id`, `name`
 * and the rest go to the radiogroup.
 *
 * <RatingField label="Rate this release" name="rating" clearable />
 */
export const RatingField = forwardRef<HTMLDivElement, RatingFieldProps>(
  function RatingField(props, ref) {
    const [fieldProps, { id, disabled, className, style, ...ratingProps }] =
      splitFieldLabelProps(props)
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <Rating ref={ref} {...ratingProps} />
      </Field>
    )
  },
)
