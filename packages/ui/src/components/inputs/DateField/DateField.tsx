import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { DateInput, type DateInputProps } from '#components/inputs/DateInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface DateFieldProps
  extends FieldLabelProps, Omit<DateInputProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled date, typed part by part or picked from a calendar.
 *
 * @remarks
 * `DateField` is a {@link Field | Field} around a {@link DateInput | DateInput}.
 *
 * @privateRemarks
 * Label + DateInput + description + error. Input props (`value`, `min`, `max`…) and the ref go
 * to the input's box; `className`/`style` go to the wrapper.
 *
 * <DateField label="Due date" value={due} onValueChange={setDue} min="2026-10-01" />
 */
export const DateField = forwardRef<HTMLDivElement, DateFieldProps>(function DateField(props, ref) {
  const [fieldProps, rest] = splitFieldLabelProps(props)
  const { id, disabled, className, style, ...inputRest } = rest
  return (
    <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
      <DateInput ref={ref} id={id} disabled={disabled} {...inputRest} />
    </Field>
  )
})
