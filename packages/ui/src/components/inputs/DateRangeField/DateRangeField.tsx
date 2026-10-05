import {
  forwardRef,
  useState,
  type FocusEvent,
  type FocusEventHandler,
  type HTMLAttributes,
} from 'react'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { Fieldset } from '#components/inputs/Fieldset'
import { Input } from '#components/inputs/Input'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'
import { hasError } from '#components/inputs/internal/errors'
import styles from './DateRangeField.module.css'

/** Two ISO dates (`YYYY-MM-DD`); `''` for an unset end. */
export interface DateRangeValue {
  start: string
  end: string
}

export interface DateRangeFieldProps
  extends
    FieldLabelProps,
    Omit<
      HTMLAttributes<HTMLFieldSetElement>,
      'onChange' | 'defaultValue' | 'onBlur' | keyof FieldLabelProps
    > {
  value?: DateRangeValue
  defaultValue?: DateRangeValue
  onValueChange?: (value: DateRangeValue) => void
  /** Earliest date either end may take (`YYYY-MM-DD`). */
  min?: string
  /** Latest date either end may take (`YYYY-MM-DD`). */
  max?: string
  /** Label of the first input. Default `'Start date'`. */
  startLabel?: string
  /** Label of the second input. Default `'End date'`. */
  endLabel?: string
  /** Submits `${name}.start` and `${name}.end`. */
  name?: string
  disabled?: boolean
  readOnly?: boolean
  /** Fires when focus leaves both inputs (not when it moves from start to end). */
  onBlur?: FocusEventHandler
  size?: Size
}

const EMPTY: DateRangeValue = { start: '', end: '' }

/**
 * A start and end date as two native date inputs under one legend.
 *
 * @remarks
 * `DateRangeField` is two native date inputs, side by side and wrapping on a phone, under one
 * legend. Native inputs mean the platform's own date picker and its accessibility.
 *
 * @privateRemarks
 * A date range as two native date inputs under one legend, side by side and wrapping
 * when narrow. The start can't pass the end and the end can't come before the start
 * (each input's `min`/`max` follows the other). `id` goes to the start input; the ref to
 * the fieldset.
 *
 * <DateRangeField label="Trip dates" value={dates} onValueChange={setDates} />
 */
export const DateRangeField = forwardRef<HTMLFieldSetElement, DateRangeFieldProps>(
  function DateRangeField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    // `layout` goes to the Fieldset (legend column for `horizontal`); the two inputs always
    // sit side by side.
    const { label, labelHidden, hint, description, readOnly = false, ...fieldsetProps } = fieldProps
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
      min,
      max,
      startLabel = 'Start date',
      endLabel = 'End date',
      name,
      disabled = false,
      onBlur,
      size,
      id,
      className,
      ...restProps
    } = rest

    const [internal, setInternal] = useState<DateRangeValue>(defaultValue ?? EMPTY)
    const value = valueProp ?? internal

    const update = (part: keyof DateRangeValue, next: string) => {
      if (readOnly) return
      const nextValue = { ...value, [part]: next }
      if (valueProp === undefined) setInternal(nextValue)
      onValueChange?.(nextValue)
    }

    const handleBlur = (event: FocusEvent<HTMLFieldSetElement>) => {
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))
        return
      onBlur?.(event)
    }

    const invalid = hasError(fieldsetProps.error) || undefined
    const required = fieldsetProps.required
    const busy = fieldsetProps.validating ? true : undefined

    return (
      <Fieldset
        ref={ref}
        {...restProps}
        {...fieldsetProps}
        legend={label}
        legendHidden={labelHidden}
        description={description ?? hint}
        disabled={disabled}
        readOnly={readOnly}
        className={cx(styles.root, className)}
        onBlur={handleBlur}
      >
        <div className={styles.parts}>
          <Field
            label={startLabel}
            htmlFor={id}
            className={styles.part}
            error={invalid}
            errorHidden
            disabled={disabled}
            readOnly={readOnly}
          >
            <Input
              id={id}
              type="date"
              size={size}
              name={name != null ? `${name}.start` : undefined}
              value={value.start}
              min={min}
              max={value.end || max}
              required={required}
              aria-busy={busy}
              onChange={(event) => {
                update('start', event.target.value)
              }}
            />
          </Field>
          <Field
            label={endLabel}
            className={styles.part}
            error={invalid}
            errorHidden
            disabled={disabled}
            readOnly={readOnly}
          >
            <Input
              type="date"
              size={size}
              name={name != null ? `${name}.end` : undefined}
              value={value.end}
              min={value.start || min}
              max={max}
              required={required}
              aria-busy={busy}
              onChange={(event) => {
                update('end', event.target.value)
              }}
            />
          </Field>
        </div>
      </Fieldset>
    )
  },
)
