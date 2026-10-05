import { forwardRef } from 'react'
import {
  ChipGroup,
  type ChipGroupMultipleProps,
  type ChipGroupProps,
  type ChipGroupSingleProps,
} from '#components/actions/ChipGroup'
import { toFieldsetProps } from '#components/inputs/CheckboxGroup/choice'
import type { FieldLabelProps } from '#components/inputs/Field'
import { Fieldset } from '#components/inputs/Fieldset'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

type Shared = Omit<
  ChipGroupProps,
  'invalid' | 'type' | 'value' | 'defaultValue' | 'onValueChange' | keyof FieldLabelProps
>

export type ChipGroupFieldProps = FieldLabelProps &
  Shared &
  (ChipGroupSingleProps | ChipGroupMultipleProps)

/**
 * A group of chips under a legend, with help, warning and error for the group.
 *
 * @remarks
 * `ChipGroupField` is a {@link ChipGroup | ChipGroup} under a {@link Fieldset | Fieldset} legend.
 * `type="multiple"` picks several, `type="single"` at most one.
 *
 * @privateRemarks
 * A `ChipGroup` under a `<Fieldset>` legend, with help, warning and error for the group.
 * `className`/`style` go to the fieldset; `ref`, `id`, `name` and the rest go to the group.
 *
 * <ChipGroupField type="multiple" label="Deploy alerts" name="alerts" options={alerts} />
 */
export const ChipGroupField = forwardRef<HTMLDivElement, ChipGroupFieldProps>(
  function ChipGroupField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { className, style, disabled, ...groupProps } = rest
    return (
      <Fieldset
        {...toFieldsetProps(fieldProps)}
        disabled={disabled}
        className={className}
        style={style}
      >
        <ChipGroup ref={ref} {...(groupProps as ChipGroupProps)} />
      </Fieldset>
    )
  },
)
