import type { FocusEvent } from 'react'
import {
  Amount,
  AmountField as UiAmountField,
  type AmountFieldProps as UiAmountFieldProps,
  type AmountUnit,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormAmountFieldProps
  extends Omit<UiAmountFieldProps, ControlledKeys>, CommonFieldProps<number | null> {}

/** Currency's fraction digits (AUD/USD 2, JPY 0, BHD 3), the same way `AmountInput` resolves them. */
function currencyDigits(currency: string, locale: string | undefined): number {
  try {
    return (
      new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions()
        .maximumFractionDigits ?? 2
    )
  } catch {
    return 2
  }
}

/** `AmountInput`'s `value` is in its own `unit`: dollars for `major`, integer cents for `minor`. */
function toMajor(
  value: number,
  unit: AmountUnit | undefined,
  currency: string,
  locale: string | undefined,
): number {
  if (unit !== 'minor') return value
  return Number(`${String(value)}e-${String(currencyDigits(currency, locale))}`)
}

/**
 * A money field bound to a `number` path. Clearing it writes `null`.
 *
 * @remarks
 * It renders kiln-ui's {@link AmountField | AmountField}.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "amount",
 *   "name": "topUp",
 *   "label": "Top-up",
 *   "currency": "GBP",
 *   "locale": "en-GB"
 * }
 * ```
 *
 * @value `number \| null`
 * @empty `null`
 *
 * @privateRemarks
 * A money field bound to a `number` path (§7.2 `amount`) — the path may additionally be
 * `null`/`undefined`: clearing the input always emits `null`. `unit: 'minor'` stores integer
 * minor units (recommended for money); view mode always renders a formatted major amount with
 * `Amount`.
 */
export const FormAmountField = defineField<number>()(function FormAmountField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormAmountFieldProps) {
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
        {binding.value === null ? undefined : (
          <Amount
            value={toMajor(binding.value, props.unit, props.currency, props.locale)}
            currency={props.currency}
            {...(props.locale !== undefined ? { locale: props.locale } : {})}
          />
        )}
      </FieldView>
    )
  }
  return (
    <UiAmountField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      value={binding.value}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
