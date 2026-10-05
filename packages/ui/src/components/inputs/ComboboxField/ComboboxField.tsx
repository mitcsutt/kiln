import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import {
  Combobox,
  type ComboboxMultipleProps,
  type ComboboxProps,
  type ComboboxSingleProps,
} from '#components/inputs/Combobox'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

type OwnProps<P> = Omit<P, 'invalid' | keyof FieldLabelProps>

export type ComboboxFieldSingleProps = FieldLabelProps & OwnProps<ComboboxSingleProps>
export type ComboboxFieldMultipleProps = FieldLabelProps & OwnProps<ComboboxMultipleProps>

/** Single (`value: string | null`) or `multiple` (`value: readonly string[]`). */
export type ComboboxFieldProps = ComboboxFieldSingleProps | ComboboxFieldMultipleProps

/**
 * Label + Combobox + description + warning + error. Combobox props (`options`, `value`,
 * `multiple`, `creatable`…) and the ref go to the text input; `className`/`style` go to
 * the field wrapper. `onBlur` fires once focus leaves the whole control.
 *
 * <ComboboxField label="Country" options={countries} placeholder="Search countries" />
 * <ComboboxField label="Labels" multiple creatable options={labels} maxSelected={5} />
 */
export const ComboboxField = forwardRef<HTMLInputElement, ComboboxFieldProps>(
  function ComboboxField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, ...comboboxProps } = rest
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <Combobox ref={ref} id={id} disabled={disabled} {...(comboboxProps as ComboboxProps)} />
      </Field>
    )
  },
)
