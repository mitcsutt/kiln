import type { FocusEvent } from 'react'
import {
  SegmentedField as UiSegmentedField,
  type SegmentedFieldProps as UiSegmentedFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { useOptionMapping } from '#hooks/useOptionMapping'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineOptionField, type FieldOption } from '#kit/contracts'

/** The base value of a segmented option (§7.2 `segmented`: no booleans). */
export type SegmentedValue = string | number

export interface FormSegmentedFieldProps
  extends
    Omit<UiSegmentedFieldProps, ControlledKeys | 'options'>,
    CommonFieldProps<SegmentedValue | null> {
  options?: readonly FieldOption<SegmentedValue>[]
}

/**
 * One choice from 2–5 peers, as a `SegmentedControl` (§7.2 `segmented`). Option values keep
 * their primitive type; empty is `null`.
 */
export const FormSegmentedField = defineOptionField<SegmentedValue>()(function FormSegmentedField({
  warn,
  excluded,
  onBlur,
  options,
  ...props
}: FormSegmentedFieldProps) {
  const binding = useFieldBinding<SegmentedValue | null>({
    ...props,
    warn,
    excluded,
    accepts: accepts.primitiveOrNull,
    empty: null,
  })
  const mapping = useOptionMapping(options)
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{mapping.labelOf(binding.value)}</FieldView>
  return (
    <UiSegmentedField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      options={mapping.uiOptions}
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
})
