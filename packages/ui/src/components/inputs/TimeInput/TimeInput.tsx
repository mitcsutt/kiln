import { forwardRef, useMemo, useRef, type FocusEventHandler, type HTMLAttributes } from 'react'
import { CloseIcon } from '#icons'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { useControllableState } from '#components/inputs/Combobox/useControllableState'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { useMergedRefs } from '#components/inputs/internal/refs'
import {
  DateSegments,
  draftFromParts,
  draftTime,
  segmentPattern,
  useSegmentDraft,
  type Draft,
} from '#components/inputs/internal/DateSegments'
import {
  DEFAULT_LOCALE,
  dayPeriodNames,
  defaultHourCycle,
  formatTime,
  parseTime,
  type TimeGranularity,
} from '#components/inputs/internal/dates'
import {
  DEFAULT_DATE_TIME_LABELS,
  focusSegment,
  handleBoxPointerDown,
  isLeaving,
  type DateTimeLabels,
} from '#components/inputs/internal/picker'
import control from '#components/inputs/internal/control.module.css'
import picker from '#components/inputs/internal/picker.module.css'

export interface TimeInputProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'onBlur' | 'onFocus'
> {
  /** `HH:mm` (or `HH:mm:ss` with `granularity="second"`) on the 24-hour clock, or `''`. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** `minute` (default) or `second`: the smallest part shown and kept. */
  granularity?: TimeGranularity
  /** 12 (with am/pm) or 24. Defaults to the locale's own clock. The value is always 24-hour. */
  hourCycle?: 12 | 24
  /** Earliest time (`HH:mm`); an earlier one is marked invalid. */
  min?: string
  /** Latest time (`HH:mm`). */
  max?: string
  /** BCP 47 locale for the clock and the order of the parts. Default `en-AU`. */
  locale?: string
  /** Show a clear button while there's a value. */
  clearable?: boolean
  /** Submits the time (`''` when incomplete). */
  name?: string
  form?: string
  size?: Size
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Critical border + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /** Fires once focus leaves the whole control, not as it moves between parts. */
  onBlur?: FocusEventHandler<HTMLElement>
  onFocus?: FocusEventHandler<HTMLElement>
  labels?: Partial<DateTimeLabels>
}

const secondsOf = (text: string | undefined): number | null => {
  const time = parseTime(text ?? '')
  return time ? (time.hour * 60 + time.minute) * 60 + time.second : null
}

/** Whether `value` falls before `min` or after `max` (all `HH:mm[:ss]`). */
export function isTimeOutOfRange(value: string, min?: string, max?: string): boolean {
  const seconds = secondsOf(value)
  if (seconds === null) return false
  const lower = secondsOf(min)
  const upper = secondsOf(max)
  return (lower !== null && seconds < lower) || (upper !== null && seconds > upper)
}

/**
 * A time of day typed part by part, on the locale's 12- or 24-hour clock.
 *
 * @remarks
 * `TimeInput` holds a time as `HH:mm` on the 24-hour clock (`14:30`), or `HH:mm:ss` with
 * `granularity="second"`, whatever clock it shows. The hour, minute, second and am/pm are separate
 * parts: type the digits and it moves on by itself, step a part with the arrow keys, or type `a`
 * or `p` for am or pm. The clock follows `locale` unless you set `hourCycle`. For the usual
 * labelled field, use {@link TimeField | TimeField}.
 *
 * @privateRemarks
 * Same segment engine as DateInput, no popover: a time is quicker typed than picked. The ref goes
 * to the `role="group"` box; the first part takes the Field's `id`.
 *
 * <TimeInput value={opens} onValueChange={setOpens} hourCycle={12} />
 */
export const TimeInput = markFieldAware(
  forwardRef<HTMLDivElement, TimeInputProps>(function TimeInput(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      granularity = 'minute',
      hourCycle: hourCycleProp,
      min,
      max,
      locale = DEFAULT_LOCALE,
      clearable = false,
      name,
      form,
      size = 'md',
      id: idProp,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      required: requiredProp,
      invalid: invalidProp,
      onBlur,
      onFocus,
      labels: labelsProp,
      className,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref,
  ) {
    const labels = { ...DEFAULT_DATE_TIME_LABELS, ...labelsProp }
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      required: requiredProp,
    })
    const rootRef = useRef<HTMLDivElement>(null)
    const composedRef = useMergedRefs(ref, rootRef)
    const hourCycle = hourCycleProp ?? defaultHourCycle(locale)
    const pattern = useMemo(
      () => segmentPattern('time', locale, granularity, hourCycle),
      [locale, granularity, hourCycle],
    )
    const periodNames = useMemo(() => dayPeriodNames(locale), [locale])
    const [value, setValue] = useControllableState(valueProp, defaultValue ?? '', onValueChange)
    const toDraft = (text: string): Draft => draftFromParts(null, parseTime(text))
    const fromDraft = (draft: Draft): string => {
      const time = draftTime(draft)
      return time && (granularity === 'minute' || draft.second !== undefined)
        ? formatTime(time, granularity)
        : ''
    }
    const [draft, setDraft] = useSegmentDraft(value, toDraft, fromDraft, setValue)
    const interactive = !field.disabled && !field.readOnly
    const invalid = field.invalid || isTimeOutOfRange(value, min, max)
    const hasEntry = Object.keys(draft).length > 0
    const now = new Date()
    const reference: Draft = { hour: now.getHours(), minute: now.getMinutes(), second: 0 }

    return (
      <div
        ref={composedRef}
        role="group"
        className={cx(control.box, picker.root, className)}
        data-size={size}
        data-invalid={invalid || undefined}
        data-disabled={field.disabled || undefined}
        data-readonly={field.readOnly || undefined}
        aria-labelledby={ariaLabelledBy ?? field.labelId}
        aria-describedby={field.describedBy}
        aria-busy={field.busy || undefined}
        {...rest}
        onPointerDown={handleBoxPointerDown}
        onFocus={(event) => {
          if (isLeaving(event, rootRef)) onFocus?.(event)
        }}
        onBlur={(event) => {
          if (isLeaving(event, rootRef)) onBlur?.(event)
        }}
      >
        <DateSegments
          pattern={pattern}
          draft={draft}
          onDraftChange={setDraft}
          hourCycle={hourCycle}
          periodNames={periodNames}
          labels={labels}
          reference={reference}
          firstId={field.id}
          disabled={field.disabled}
          readOnly={field.readOnly}
          invalid={invalid}
          required={field.required}
        />
        {clearable && interactive && hasEntry ? (
          <span className={picker.trailing}>
            <button
              type="button"
              className={picker.button}
              aria-label={labels.clear}
              onClick={() => {
                setDraft({})
                focusSegment(rootRef.current, 'first')
              }}
            >
              <CloseIcon />
            </button>
          </span>
        ) : null}
        {name !== undefined ? (
          <input
            type="hidden"
            name={name}
            form={form}
            value={value}
            disabled={field.disabled || undefined}
          />
        ) : null}
      </div>
    )
  }),
)
