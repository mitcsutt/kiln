import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { DateTimeInput, type DateTimeInputProps } from '#components/inputs/DateTimeInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface DateTimeFieldProps
  extends FieldLabelProps, Omit<DateTimeInputProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled date and time, typed part by part or picked from a calendar.
 *
 * @remarks
 * `DateTimeField` is a {@link Field | Field} around a {@link DateTimeInput | DateTimeInput}.
 *
 * @privateRemarks
 * Label + DateTimeInput + description + error. Input props (`value`, `timeZone`…) and the ref
 * go to the input's box; `className`/`style` go to the wrapper.
 *
 * <DateTimeField label="Publish at" timeZone="UTC" value={at} onValueChange={setAt} />
 */
export const DateTimeField = forwardRef<HTMLDivElement, DateTimeFieldProps>(
  function DateTimeField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, ...inputRest } = rest
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <DateTimeInput ref={ref} id={id} disabled={disabled} {...inputRest} />
      </Field>
    )
  },
)
