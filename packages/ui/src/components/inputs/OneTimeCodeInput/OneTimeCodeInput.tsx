import { forwardRef, useState, type FocusEvent, type HTMLAttributes } from 'react'
import { unstable_OneTimePasswordField as OTP } from 'radix-ui'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import styles from './OneTimeCodeInput.module.css'

export type OneTimeCodeValidation = 'numeric' | 'alpha' | 'alphanumeric'

export interface OneTimeCodeInputProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'dir'
> {
  /** Reading direction of the cells (arrow keys follow it). Inherits by default. */
  dir?: 'ltr' | 'rtl'
  /** Number of characters. Default `6`. */
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called once every cell is filled — verify here, or submit. */
  onComplete?: (value: string) => void
  /** Which characters a cell accepts; anything else is ignored (typing and paste). Default `numeric`. */
  validationType?: OneTimeCodeValidation
  /** Show dots instead of characters. */
  masked?: boolean
  /** Submitted as one value from a hidden input. */
  name?: string
  disabled?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  size?: Size
  /** Critical borders + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
}

/**
 * A one-time code as a row of single-character cells that fill from a paste or a text message.
 *
 * @remarks
 * `OneTimeCodeInput` is Radix OneTimePasswordField with Kiln's look. Typing advances, Backspace
 * goes back, a pasted or autofilled code fills every cell, and `autoComplete="one-time-code"` lets
 * a phone offer the code from a text message. `onComplete` fires when every cell is filled.
 *
 * @privateRemarks
 * A one-time code as a row of single-character cells (Radix OneTimePasswordField): typing
 * advances, Backspace goes back, a pasted or autofilled code fills every cell, and
 * `autoComplete="one-time-code"` lets phones offer the code from a text message. Cells
 * are a `group` labelled by the surrounding Field. The ref goes to the group.
 *
 * <OneTimeCodeInput length={6} onComplete={verify} />
 */
export const OneTimeCodeInput = markFieldAware(
  forwardRef<HTMLDivElement, OneTimeCodeInputProps>(function OneTimeCodeInput(
    {
      length = 6,
      value: valueProp,
      defaultValue,
      onValueChange,
      onComplete,
      validationType = 'numeric',
      masked = false,
      name,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      autoFocus,
      size = 'md',
      invalid: invalidProp,
      id: idProp,
      className,
      onBlur,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      'aria-labelledby': labelledByProp,
      ...rest
    },
    ref,
  ) {
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
    })
    const [internal, setInternal] = useState(defaultValue ?? '')
    const value = valueProp ?? internal

    const handleValueChange = (next: string) => {
      if (field.readOnly) return
      if (valueProp === undefined) setInternal(next)
      onValueChange?.(next)
      if (next.length === length) onComplete?.(next)
    }

    // Moving between cells isn't a blur; leaving the whole group is.
    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))
        return
      onBlur?.(event)
    }

    const noun = validationType === 'numeric' ? 'Digit' : 'Character'
    const splitAt = length >= 6 && length % 2 === 0 ? length / 2 : -1

    return (
      <OTP.Root
        ref={ref}
        {...rest}
        className={cx(styles.root, className)}
        data-size={size}
        data-invalid={field.invalid || undefined}
        data-disabled={field.disabled || undefined}
        data-readonly={field.readOnly || undefined}
        value={value.slice(0, length)}
        onValueChange={handleValueChange}
        validationType={validationType}
        type={masked ? 'password' : 'text'}
        autoComplete="one-time-code"
        // Only when the consumer asks for it, e.g. a code screen with nothing else to do.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        disabled={field.disabled}
        readOnly={field.readOnly}
        name={name}
        aria-labelledby={labelledByProp ?? field.labelId}
        aria-describedby={field.describedBy}
        aria-busy={field.busy || undefined}
        onBlur={handleBlur}
      >
        {Array.from({ length }, (_, index) => (
          <OTP.Input
            key={index}
            index={index}
            id={index === 0 ? field.id : undefined}
            className={styles.cell}
            data-group-start={index === splitAt || undefined}
            aria-label={`${noun} ${String(index + 1)} of ${String(length)}`}
            aria-invalid={field.invalid || undefined}
            aria-required={field.required || undefined}
          />
        ))}
        {/* Radix's hidden input can't be disabled (its props omit `disabled`), so it isn't
          rendered at all while disabled: a disabled control must submit nothing. */}
        {field.disabled ? null : <OTP.HiddenInput />}
      </OTP.Root>
    )
  }),
)
