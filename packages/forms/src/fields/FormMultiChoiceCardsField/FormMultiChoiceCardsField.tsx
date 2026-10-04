import type { FocusEvent, ReactNode } from 'react'
import {
  ChoiceCardsField as UiChoiceCardsField,
  Tag,
  TagList,
  type ChoiceCardOption,
  type ChoiceCardsFieldProps as UiChoiceCardsFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { useOptionMapping } from '#core/binding/optionValues'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineOptionsField, type FieldOption } from '#core/kit/contracts'

/** The base value of a choice-card option (§7.2 `multiChoiceCards`: no booleans). */
export type MultiChoiceCardValue = string | number

type UiMultipleProps = Extract<UiChoiceCardsFieldProps, { type: 'multiple' }>

export interface FormMultiChoiceCardsFieldProps
  extends
    Omit<UiMultipleProps, ControlledKeys | 'options' | 'type'>,
    CommonFieldProps<readonly MultiChoiceCardValue[]> {
  options?: readonly FieldOption<MultiChoiceCardValue>[]
  /** A figure or short fact at the foot of an option's card, keyed by its value. */
  optionMeta?: (value: MultiChoiceCardValue) => ReactNode
}

/**
 * Any number of choices from a handful of cards (§7.2 `multiChoiceCards`, ui `type="multiple"`).
 * Option values keep their primitive type; empty is `[]`.
 */
export const FormMultiChoiceCardsField = defineOptionsField<MultiChoiceCardValue>()(
  function FormMultiChoiceCardsField({
    warn,
    excluded,
    onBlur,
    options,
    optionMeta,
    ...props
  }: FormMultiChoiceCardsFieldProps) {
    const binding = useFieldBinding<readonly MultiChoiceCardValue[]>({
      ...props,
      warn,
      excluded,
      accepts: accepts.arrayOfPrimitive,
      empty: [],
    })
    const mapping = useOptionMapping(options)
    if (binding.mode === 'view') {
      const labels = binding.value.map((value) => mapping.labelOf(value) ?? String(value))
      return (
        <FieldView label={props.label}>
          {labels.length > 0 ? (
            <TagList>
              {labels.map((label) => (
                <Tag key={label}>{label}</Tag>
              ))}
            </TagList>
          ) : undefined}
        </FieldView>
      )
    }
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
        type="multiple"
        options={cardOptions}
        value={binding.value.map(mapping.toUi)}
        onValueChange={(next) => {
          binding.setValue(
            next
              .map(mapping.fromUi)
              .filter((value): value is MultiChoiceCardValue => value !== null),
          )
        }}
        onBlur={(event: FocusEvent<HTMLDivElement>) => {
          onBlur?.(event)
          binding.onBlur()
        }}
      />
    )
  },
)
