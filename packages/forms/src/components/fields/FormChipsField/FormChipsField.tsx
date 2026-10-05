import type { FocusEvent } from 'react'
import {
  ChipGroupField as UiChipGroupField,
  Tag,
  TagList,
  type ChipGroupFieldProps as UiChipGroupFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { useOptionMapping } from '#hooks/useOptionMapping'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineOptionsField, type FieldOption } from '#kit/contracts'

/** The base value of a chips option (§7.2 `chips`: no booleans). */
export type ChipsValue = string | number

type UiMultipleProps = Extract<UiChipGroupFieldProps, { type: 'multiple' }>

export interface FormChipsFieldProps
  extends
    Omit<UiMultipleProps, ControlledKeys | 'options' | 'type'>,
    CommonFieldProps<readonly ChipsValue[]> {
  options?: readonly FieldOption<ChipsValue>[]
}

/**
 * Any number of choices from a row of chips.
 *
 * @remarks
 * It renders kiln-ui's {@link ChipGroupField | ChipGroupField} with `type="multiple"`.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "chips",
 *   "name": "days",
 *   "label": "Days you travel",
 *   "options": [
 *     {
 *       "value": "mon",
 *       "label": "Mon"
 *     }
 *   ]
 * }
 * ```
 *
 * @value an array of the options' value type
 * @empty `[]`
 *
 * @privateRemarks
 * Any number of choices from a row of chips (§7.2 `chips`, ui `type="multiple"`). Option values
 * keep their primitive type; empty is `[]`.
 */
export const FormChipsField = defineOptionsField<ChipsValue>()(function FormChipsField({
  warn,
  excluded,
  onBlur,
  options,
  ...props
}: FormChipsFieldProps) {
  const binding = useFieldBinding<readonly ChipsValue[]>({
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
  return (
    <UiChipGroupField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      type="multiple"
      options={mapping.uiOptions}
      value={binding.value.map(mapping.toUi)}
      onValueChange={(next) => {
        binding.setValue(
          next.map(mapping.fromUi).filter((value): value is ChipsValue => value !== null),
        )
      }}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
