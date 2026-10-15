import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { TimeInput, type TimeInputProps } from '#components/inputs/TimeInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface TimeFieldProps
  extends FieldLabelProps, Omit<TimeInputProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled time of day, typed part by part on the locale's clock.
 *
 * @remarks
 * `TimeField` is a {@link Field | Field} around a {@link TimeInput | TimeInput}.
 *
 * @privateRemarks
 * Label + TimeInput + description + error. Input props and the ref go to the input's box;
 * `className`/`style` go to the wrapper.
 *
 * <TimeField label="Opens at" value={opens} onValueChange={setOpens} />
 */
export const TimeField = forwardRef<HTMLDivElement, TimeFieldProps>(function TimeField(props, ref) {
  const [fieldProps, rest] = splitFieldLabelProps(props)
  const { id, disabled, className, style, ...inputRest } = rest
  return (
    <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
      <TimeInput ref={ref} id={id} disabled={disabled} {...inputRest} />
    </Field>
  )
})
