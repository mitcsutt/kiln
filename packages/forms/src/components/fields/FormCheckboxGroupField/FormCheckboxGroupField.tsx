import type { FocusEvent } from 'react'
import {
  CheckboxGroupField as UiCheckboxGroupField,
  Tag,
  TagList,
  type CheckboxGroupFieldProps as UiCheckboxGroupFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { useOptionMapping } from '#hooks/useOptionMapping'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineOptionsField, type FieldOption } from '#kit/contracts'

/** The base value of a checkbox-group option (§7.2 `checkboxGroup`: no booleans). */
export type CheckboxGroupValue = string | number

export interface FormCheckboxGroupFieldProps
  extends
    Omit<UiCheckboxGroupFieldProps, ControlledKeys | 'options'>,
    CommonFieldProps<readonly CheckboxGroupValue[]> {
  options?: readonly FieldOption<CheckboxGroupValue>[]
}

/**
 * Any number of choices from a short list, as checkboxes under a legend.
 *
 * @remarks
 * It renders kiln-ui's {@link CheckboxGroupField | CheckboxGroupField}.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "checkboxGroup",
 *   "name": "facilities",
 *   "label": "Facilities you need",
 *   "options": [
 *     {
 *       "value": "step-free",
 *       "label": "Step-free access"
 *     }
 *   ]
 * }
 * ```
 *
 * @value an array of the options' value type
 * @empty `[]`
 *
 * @privateRemarks
 * Any number of choices from a short list, as checkboxes (§7.2 `checkboxGroup`). Option values
 * keep their primitive type; empty is `[]`.
 */
export const FormCheckboxGroupField = defineOptionsField<CheckboxGroupValue>()(
  function FormCheckboxGroupField({
    warn,
    excluded,
    onBlur,
    options,
    ...props
  }: FormCheckboxGroupFieldProps) {
    const binding = useFieldBinding<readonly CheckboxGroupValue[]>({
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
      <UiCheckboxGroupField
        {...props}
        {...binding.fieldProps}
        ref={binding.ref}
        options={mapping.uiOptions}
        value={binding.value.map(mapping.toUi)}
        onValueChange={(next) => {
          binding.setValue(
            next.map(mapping.fromUi).filter((value): value is CheckboxGroupValue => value !== null),
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
