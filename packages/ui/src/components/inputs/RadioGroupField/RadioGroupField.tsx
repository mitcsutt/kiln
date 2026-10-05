import { forwardRef } from 'react'
import {
  useControllableValue,
  useFocusLeave,
  toFieldsetProps,
  type ChoiceOption,
} from '#components/inputs/CheckboxGroup/choice'
import type { FieldLabelProps } from '#components/inputs/Field'
import { Fieldset } from '#components/inputs/Fieldset'
import { RadioGroup, type RadioGroupProps } from '#components/inputs/RadioGroup'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface RadioGroupFieldProps
  extends FieldLabelProps, Omit<RadioGroupProps, 'invalid' | 'children' | keyof FieldLabelProps> {
  options: readonly ChoiceOption[]
  /** `vertical` (default) stacks the options; `horizontal` runs them in a wrapping row. */
  orientation?: 'vertical' | 'horizontal'
}

/**
 * One choice from a short list, with labels, descriptions and a legend for the set.
 *
 * @remarks
 * `RadioGroupField` lays out a {@link RadioGroup | RadioGroup} from `options` under a {@link
 * Fieldset | Fieldset} legend, each option with a label and an optional description. Arrow keys
 * move and select.
 *
 * @privateRemarks
 * One choice from a short list, under a `<Fieldset>` legend. Arrow keys move and select;
 * the group is one tab stop. `className`/`style` go to the fieldset; `ref`, `id`, `name`
 * and the rest go to the radio group (`name` submits the checked value natively).
 *
 * <RadioGroupField label="Billing period" name="period" options={periods} defaultValue="monthly" />
 */
export const RadioGroupField = forwardRef<HTMLDivElement, RadioGroupFieldProps>(
  function RadioGroupField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const {
      options,
      value,
      defaultValue,
      onValueChange,
      onBlur,
      className,
      style,
      disabled,
      ...groupProps
    } = rest
    // Hold the value here so read-only also holds for an uncontrolled group.
    const [current, setCurrent] = useControllableValue(
      value === null ? '' : value,
      defaultValue ?? '',
      onValueChange,
      fieldProps.readOnly,
    )
    const handleBlur = useFocusLeave(onBlur)
    return (
      <Fieldset
        {...toFieldsetProps(fieldProps)}
        disabled={disabled}
        className={className}
        style={style}
      >
        <RadioGroup
          ref={ref}
          value={current}
          onValueChange={setCurrent}
          onBlur={handleBlur}
          {...groupProps}
        >
          {options.map((o) => (
            <RadioGroup.Item
              key={o.value}
              value={o.value}
              label={o.label}
              description={o.description}
              disabled={o.disabled}
            />
          ))}
        </RadioGroup>
      </Fieldset>
    )
  },
)
