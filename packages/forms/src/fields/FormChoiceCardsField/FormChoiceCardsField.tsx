import type { FocusEvent, ReactNode } from 'react'
import {
  ChoiceCardsField as UiChoiceCardsField,
  type ChoiceCardOption,
  type ChoiceCardsFieldProps as UiChoiceCardsFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { useOptionMapping } from '#core/binding/optionValues'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineOptionField, type FieldOption } from '#core/kit/contracts'

/** The base value of a choice-card option (§7.2 `choiceCards`: no booleans). */
export type ChoiceCardValue = string | number

type UiSingleProps = Extract<UiChoiceCardsFieldProps, { type: 'single' }>

export interface FormChoiceCardsFieldProps
  extends
    Omit<UiSingleProps, ControlledKeys | 'options' | 'type'>,
    CommonFieldProps<ChoiceCardValue | null> {
  options?: readonly FieldOption<ChoiceCardValue>[]
  /** A figure or short fact at the foot of an option's card, keyed by its value. */
  optionMeta?: (value: ChoiceCardValue) => ReactNode
}

/**
 * One choice from a handful of cards (§7.2 `choiceCards`, ui `type="single"`). Option values
 * keep their primitive type; empty is `null`.
 */
export const FormChoiceCardsField = defineOptionField<ChoiceCardValue>()(
  function FormChoiceCardsField({
    warn,
    excluded,
    onBlur,
    options,
    optionMeta,
    ...props
  }: FormChoiceCardsFieldProps) {
    const binding = useFieldBinding<ChoiceCardValue | null>({
      ...props,
      warn,
      excluded,
      accepts: accepts.primitiveOrNull,
      empty: null,
    })
    const mapping = useOptionMapping(options)
    if (binding.mode === 'view')
      return <FieldView label={props.label}>{mapping.labelOf(binding.value)}</FieldView>
    const cardOptions: ChoiceCardOption[] = mapping.uiOptions.map((option) => {
      const card: ChoiceCardOption = { value: option.value, label: option.label }
      if (option.description !== undefined) card.description = option.description
      if (option.disabled !== undefined) card.disabled = option.disabled
      const value = mapping.fromUi(option.value)
      if (optionMeta && value !== null) card.meta = optionMeta(value)
      return card
    })
    return (
      <UiChoiceCardsField
        {...props}
        {...binding.fieldProps}
        ref={binding.ref}
        type="single"
        options={cardOptions}
        value={mapping.toUi(binding.value)}
        onValueChange={(next) => {
          binding.setValue(mapping.fromUi(next))
        }}
        onBlur={(event: FocusEvent<HTMLDivElement>) => {
          onBlur?.(event)
          binding.onBlur()
        }}
      />
    )
  },
)
