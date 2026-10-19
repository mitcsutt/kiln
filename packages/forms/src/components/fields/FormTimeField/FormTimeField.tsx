import type { FocusEvent } from 'react'
import {
  TextField as UiTextField,
  TimeField as UiTimeField,
  type TextFieldProps as UiTextFieldProps,
  type TimeFieldProps as UiTimeFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { pickerFieldProps } from '#components/fields/internal/pickerProps'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'
import { formatTime } from '#components/fields/internal/formatTemporal'

export interface FormTimeFieldProps
  extends
    Omit<
      UiTextFieldProps,
      ControlledKeys | 'type' | 'min' | 'max' | 'inputMode' | 'showCount' | 'maxLength'
    >,
    Pick<UiTimeFieldProps, 'granularity' | 'hourCycle' | 'locale' | 'clearable' | 'labels'>,
    CommonFieldProps<string> {
  /** Earliest value, ISO (HH:mm). */
  min?: string
  /** Latest value, ISO (HH:mm). */
  max?: string
  /**
   * `native`: the platform's own time input. `segmented`: kiln-ui's
   * {@link TimeField | TimeField}, the hour and minute typed part by part on the locale's 12- or
   * 24-hour clock. The value is the same 24-hour ISO time whichever you choose. `granularity`,
   * `hourCycle`, `locale`, `clearable` and `labels` apply to `segmented` only, and the text
   * input's own props (`step`, `placeholder`, `leading`) to `native` only.
   */
  picker?: 'native' | 'segmented'
}

/**
 * A time bound to an ISO time string: the platform's time input, or kiln-ui's typed time.
 *
 * @remarks
 * By default it renders kiln-ui's {@link TextField | TextField} with `type="time"`.
 * `picker="segmented"` swaps in kiln-ui's {@link TimeField | TimeField}: the same theme in every
 * browser, with `hourCycle` to choose the 12- or 24-hour clock. The value stays on the 24-hour
 * clock either way.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "time",
 *   "name": "departs",
 *   "label": "Departs",
 *   "picker": "segmented",
 *   "hourCycle": 12
 * }
 * ```
 *
 * @value `string` (`HH:mm`)
 * @empty `''`
 *
 * @privateRemarks
 * A native time input bound to an ISO `HH:mm` string (§7.2). Empty is `''`. The picker is
 * opt-in (Appendix A.6), so a field without `picker` renders exactly as before.
 */
export const FormTimeField = defineField<string>()(function FormTimeField({
  warn,
  excluded,
  onBlur,
  picker = 'native',
  granularity,
  hourCycle,
  locale,
  clearable,
  labels,
  ...props
}: FormTimeFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{formatTime(binding.value, locale, hourCycle)}</FieldView>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
  const value = binding.value ?? ''
  if (picker === 'segmented')
    return (
      <UiTimeField
        {...pickerFieldProps(props)}
        {...binding.fieldProps}
        ref={binding.ref}
        value={value}
        onValueChange={binding.setValue}
        min={props.min}
        max={props.max}
        granularity={granularity}
        hourCycle={hourCycle}
        locale={locale}
        clearable={clearable}
        labels={labels}
        onBlur={(event) => {
          // The picker blurs from one of its parts, not an `<input>`; the handler only gets the
          // event to forward it.
          onBlur?.(event as FocusEvent<HTMLInputElement>)
          binding.onBlur()
        }}
      />
    )
  return (
    <UiTextField
      {...props}
      {...binding.fieldProps}
      type="time"
      ref={binding.ref}
      value={value}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
