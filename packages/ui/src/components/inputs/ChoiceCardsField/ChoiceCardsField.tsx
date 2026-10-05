import { forwardRef } from 'react'
import {
  ChoiceCards,
  type ChoiceCardsMultipleProps,
  type ChoiceCardsProps,
  type ChoiceCardsSingleProps,
} from '#components/inputs/ChoiceCards'
import { toFieldsetProps } from '#components/inputs/CheckboxGroup/choice'
import type { FieldLabelProps } from '#components/inputs/Field'
import { Fieldset } from '#components/inputs/Fieldset'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

type Shared = Omit<
  ChoiceCardsProps,
  'invalid' | 'type' | 'value' | 'defaultValue' | 'onValueChange' | keyof FieldLabelProps
>

export type ChoiceCardsFieldProps = FieldLabelProps &
  Shared &
  (ChoiceCardsSingleProps | ChoiceCardsMultipleProps)

/**
 * Choice cards under a legend, with help, warning and error for the set.
 *
 * @remarks
 * `ChoiceCardsField` is {@link ChoiceCards | ChoiceCards} under a {@link Fieldset | Fieldset}
 * legend. Use `type="single"` for one of the cards, `type="multiple"` for any number.
 *
 * @privateRemarks
 * `ChoiceCards` under a `<Fieldset>` legend, with help, warning and error for the set.
 * `className`/`style` go to the fieldset; `ref`, `id`, `name` and the rest go to the cards.
 *
 * <ChoiceCardsField type="single" label="Plan" name="plan" options={plans} columns={{ base: 1, sm: 3 }} />
 */
export const ChoiceCardsField = forwardRef<HTMLDivElement, ChoiceCardsFieldProps>(
  function ChoiceCardsField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { className, style, disabled, ...cardsProps } = rest
    return (
      <Fieldset
        {...toFieldsetProps(fieldProps)}
        disabled={disabled}
        className={className}
        style={style}
      >
        <ChoiceCards ref={ref} {...(cardsProps as ChoiceCardsProps)} />
      </Fieldset>
    )
  },
)
