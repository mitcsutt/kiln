import type { FocusEvent } from 'react'
import {
  Numeral,
  RatingField as UiRatingField,
  type RatingFieldProps as UiRatingFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineField } from '#core/kit/contracts'

export interface FormRatingFieldProps
  extends Omit<UiRatingFieldProps, ControlledKeys>, CommonFieldProps<number | null> {}

/** A star rating bound to a `number` path (§7.2 `rating`). Clearing emits `null`. */
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
