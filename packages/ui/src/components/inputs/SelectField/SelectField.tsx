import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { Select, type SelectProps } from '#components/inputs/Select'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export type { SelectOption, SelectGroup } from '#components/inputs/Select'

export interface SelectFieldProps extends FieldLabelProps, Omit<SelectProps, 'invalid'> {}

/**
 * A labelled select with description, error and warning.
 *
 * @remarks
 * `SelectField` is a {@link Field | Field} around a {@link Select | Select}. Select props
 * (`options`, `groups`, `value`, `placeholder`) go to the select.
 *
 * @privateRemarks
 * Label + Select + description + error. Select props (`options`, `value`,
 * `onValueChange`, `placeholder`…) and the ref go to the trigger; `className`/`style` go
 * to the field wrapper.
 *
 * <SelectField label="Category" options={categories} placeholder="Choose one" required />
 */
export const SelectField = forwardRef<HTMLButtonElement, SelectFieldProps>(
  function SelectField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, ...selectRest } = rest
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <Select ref={ref} id={id} disabled={disabled} {...selectRest} />
      </Field>
    )
  },
)
