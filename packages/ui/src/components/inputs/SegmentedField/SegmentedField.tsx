import { forwardRef } from 'react'
import { SegmentedControl, type SegmentedControlProps } from '#components/actions/SegmentedControl'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface SegmentedFieldProps
  extends
    FieldLabelProps,
    Omit<SegmentedControlProps, 'children' | 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled segmented control for one of two to five peers, always one selected.
 *
 * @remarks
 * `SegmentedField` is a {@link SegmentedControl | SegmentedControl} with a label, description and
 * error. It always has one segment selected, so it suits choices with a sensible default.
 *
 * @privateRemarks
 * A labelled `SegmentedControl` — one of 2–5 peers, always one selected. The control is
 * labelled by the Field's label and described by its help, warning and error.
 * `className`/`style` go to the Field; `ref`, `id`, `name` and the rest go to the control.
 *
 * <SegmentedField label="Billing period" name="period" options={periods} layout="horizontal" />
 */
export const SegmentedField = forwardRef<HTMLDivElement, SegmentedFieldProps>(
  function SegmentedField(props, ref) {
    const [fieldProps, { id, disabled, className, style, ...controlProps }] =
      splitFieldLabelProps(props)
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <SegmentedControl ref={ref} {...controlProps} />
      </Field>
    )
  },
)
