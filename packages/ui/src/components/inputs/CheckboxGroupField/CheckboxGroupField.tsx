import { forwardRef } from 'react'
import { CheckboxGroup, type CheckboxGroupProps } from '#components/inputs/CheckboxGroup'
import { toFieldsetProps } from '#components/inputs/CheckboxGroup/choice'
import type { FieldLabelProps } from '#components/inputs/Field'
import { Fieldset } from '#components/inputs/Fieldset'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface CheckboxGroupFieldProps
  extends FieldLabelProps, Omit<CheckboxGroupProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * Several choices from a set, under one legend, with help, warning and error for the set.
 *
 * @remarks
 * `CheckboxGroupField` is a {@link CheckboxGroup | CheckboxGroup} under a {@link Fieldset |
 * Fieldset} legend. The error and warning describe the set, not one box.
 *
 * @privateRemarks
 * A `CheckboxGroup` under a `<Fieldset>` legend, with help, warning and error for the
 * group as a whole. `className`/`style` go to the fieldset; `ref`, `id` and the rest go to
 * the group.
 *
 * <CheckboxGroupField label="Notify me about" name="notify" options={topics} error={errors.notify} />
 */
export const CheckboxGroupField = forwardRef<HTMLDivElement, CheckboxGroupFieldProps>(
  function CheckboxGroupField(props, ref) {
    const [fieldProps, { className, style, disabled, ...groupProps }] = splitFieldLabelProps(props)
    return (
      <Fieldset
        {...toFieldsetProps(fieldProps)}
        disabled={disabled}
        className={className}
        style={style}
      >
        <CheckboxGroup ref={ref} {...groupProps} />
      </Fieldset>
    )
  },
)
