import type { FocusEvent } from 'react'
import {
  Numeral,
  RatingField as UiRatingField,
  type RatingFieldProps as UiRatingFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormRatingFieldProps
  extends Omit<UiRatingFieldProps, ControlledKeys>, CommonFieldProps<number | null> {}

/**
 * A star rating bound to a `number` path. Clearing it writes `null`.
 *
 * @remarks
 * It renders kiln-ui's {@link RatingField | RatingField}.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "rating",
 *   "name": "rating",
 *   "label": "How was your crossing?"
 * }
 * ```
 *
 * @value `number \| null`
 * @empty `null`
 *
 * @privateRemarks
 * A star rating bound to a `number` path (§7.2 `rating`). Clearing emits `null`.
 */
export const FormRatingField = defineField<number>()(function FormRatingField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormRatingFieldProps) {
  const binding = useFieldBinding<number | null>({
    ...props,
    warn,
    excluded,
    accepts: accepts.numberOrNull,
    empty: null,
  })
  if (binding.mode === 'view') {
    return (
      <FieldView label={props.label}>
        {binding.value === null ? undefined : <Numeral value={binding.value} />}
      </FieldView>
    )
  }
  return (
    <UiRatingField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      value={binding.value}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
