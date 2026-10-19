import { forwardRef, useRef, useState, type FocusEvent } from 'react'
import { CalendarIcon } from '#icons'
import { cx } from '#utils/cx'
import { Button } from '#components/actions/Button'
import { IconButton } from '#components/actions/IconButton'
import { Popover } from '#components/overlays/Popover'
import { Calendar } from '#components/inputs/Calendar'
import { DateInput } from '#components/inputs/DateInput'
import { DateTimeInput } from '#components/inputs/DateTimeInput'
import { Field } from '#components/inputs/Field'
import { Fieldset } from '#components/inputs/Fieldset'
import { TimeInput } from '#components/inputs/TimeInput'
import { FieldContext } from '#components/inputs/internal/FieldContext'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'
import { hasError } from '#components/inputs/internal/errors'
import {
  DEFAULT_LOCALE,
  dateOf,
  defaultHourCycle,
  formatDate,
  formatDateTime,
  formatTime,
  parseDate,
  parseDateTime,
  parseTime,
  type TimeGranularity,
  type TimeOfDay,
} from '#components/inputs/internal/dates'
import { DEFAULT_DATE_TIME_LABELS, type DateTimeLabels } from '#components/inputs/internal/picker'
import picker from '#components/inputs/internal/picker.module.css'
import type { DateRangeFieldProps, DateRangeValue } from './DateRangeField'
import styles from './DateRangeField.module.css'

/** A range offered beside the calendar: "Last 7 days", "This month". */
export interface DateRangePreset {
  label: string
  /**
   * The range, or a function that works it out when picked (so "today" is always today). With a
   * time `granularity`, a date-only end runs from the start of its first day to the end of its last.
   */
  value: DateRangeValue | (() => DateRangeValue)
}

export interface DateRangePickerFieldProps extends DateRangeFieldProps {
  /** `day` (default), or `minute`/`second` to give each end a time. */
  granularity?: 'day' | TimeGranularity
  /** Ranges to offer beside the calendar. */
  presets?: readonly DateRangePreset[]
  /** Show a clear button in each input. */
  clearable?: boolean
  /** Marks dates unavailable. */
  isDateDisabled?: (date: string) => boolean
  /** 0 (Sunday) to 6 (Saturday). Defaults to the locale's week. */
  firstDayOfWeek?: number
  /** BCP 47 locale for the parts and names. Default `en-AU`. */
  locale?: string
  /**
   * The zone "today" is read in. With a time `granularity`, each end becomes a UTC instant typed as
   * this zone's clock, as in {@link DateTimeInput | DateTimeInput}.
   */
  timeZone?: string
  /** With a time `granularity`: 12 or 24. Defaults to the locale's clock. */
  hourCycle?: 12 | 24
  /** Words for another language or wording. */
  labels?: Partial<DateTimeLabels>
}

const EMPTY: DateRangeValue = { start: '', end: '' }
const MIDNIGHT: TimeOfDay = { hour: 0, minute: 0, second: 0 }
const LAST_SECOND: TimeOfDay = { hour: 23, minute: 59, second: 59 }

const resolvePreset = (preset: DateRangePreset): DateRangeValue =>
  typeof preset.value === 'function' ? preset.value() : preset.value

/**
 * A start and end date typed part by part under one legend, with one two-month calendar for the
 * range, optional times and preset ranges.
 *
 * @privateRemarks
 * The calendar picker for a range, documented on {@link DateRangeField | DateRangeField}'s page. It
 * is a separate export rather than a `picker` prop on DateRangeField, so importing DateRangeField
 * alone doesn't bring Popover, Calendar and the typed inputs (ADR 0044). The ref goes to the
 * fieldset and `id` to the start input, as in DateRangeField.
 *
 * <DateRangePickerField label="Stay" presets={presets} value={dates} onValueChange={setDates} />
 */
export const DateRangePickerField = forwardRef<HTMLFieldSetElement, DateRangePickerFieldProps>(
  function DateRangePickerField(props, ref) {
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
      granularity = 'day',
      presets,
      clearable = false,
      isDateDisabled,
      firstDayOfWeek,
      locale = DEFAULT_LOCALE,
      timeZone,
      hourCycle,
      labels: labelsProp,
      ...restProps
    } = rest

    const [internal, setInternal] = useState<DateRangeValue>(defaultValue ?? EMPTY)
    const [open, setOpen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    const value = valueProp ?? internal

    const setRange = (nextValue: DateRangeValue) => {
      if (readOnly) return
      if (valueProp === undefined) setInternal(nextValue)
      onValueChange?.(nextValue)
    }
    const update = (part: keyof DateRangeValue, next: string) => {
      setRange({ ...value, [part]: next })
    }

    const handleBlur = (event: FocusEvent<HTMLFieldSetElement>) => {
      const next = event.relatedTarget
      if (
        next instanceof Node &&
        (event.currentTarget.contains(next) || panelRef.current?.contains(next))
      )
        return
      onBlur?.(event)
    }

    const invalid = hasError(fieldsetProps.error) || undefined
    const required = fieldsetProps.required
    const busy = fieldsetProps.validating ? true : undefined

    const labels = { ...DEFAULT_DATE_TIME_LABELS, ...labelsProp }
    const withTime = granularity !== 'day'
    const timeGranularity: TimeGranularity = granularity === 'second' ? 'second' : 'minute'
    const clock = hourCycle ?? defaultHourCycle(locale)
    const interactive = !disabled && !readOnly
    const startDate = dateOf(value.start, timeZone)
    const endDate = dateOf(value.end, timeZone)
    const timeOf = (text: string) => parseDateTime(text, timeZone)?.time ?? null
    const join = (date: string, time: TimeOfDay) => {
      const day = parseDate(date)
      return day ? formatDateTime({ date: day, time }, timeGranularity, timeZone) : ''
    }
    // An end's date bounds the other end's calendar and typing; its time doesn't.
    const startMax = endDate ? formatDate(endDate) : max
    const endMin = startDate ? formatDate(startDate) : min
    const boundOf = (date: string | undefined, time: TimeOfDay) =>
      withTime && date ? join(date, time) : date

    const pickRange = (next: DateRangeValue) => {
      if (!withTime) {
        setRange(next)
        if (next.start && next.end) setOpen(false)
        return
      }
      setRange({
        start: next.start ? join(next.start, timeOf(value.start) ?? MIDNIGHT) : '',
        end: next.end ? join(next.end, timeOf(value.end) ?? LAST_SECOND) : '',
      })
    }
    const presetRange = (preset: DateRangePreset): DateRangeValue => {
      const range = resolvePreset(preset)
      if (!withTime) return range
      return {
        start: parseDate(range.start) ? join(range.start, MIDNIGHT) : range.start,
        end: parseDate(range.end) ? join(range.end, LAST_SECOND) : range.end,
      }
    }
    const setTime = (part: keyof DateRangeValue, text: string) => {
      const time = parseTime(text)
      const date = part === 'start' ? startDate : endDate
      if (time && date) update(part, join(formatDate(date), time))
    }

    const partProps = (part: keyof DateRangeValue) => ({
      size,
      name: name != null ? `${name}.${part}` : undefined,
      value: value[part],
      required,
      clearable,
      isDateDisabled,
      firstDayOfWeek,
      locale,
      timeZone,
      labels,
      calendar: false,
      'aria-busy': busy,
      onValueChange: (next: string) => {
        update(part, next)
      },
    })

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
        data-picker="calendar"
      >
        <Popover open={open && interactive} onOpenChange={setOpen}>
          <Popover.Anchor asChild>
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
                {withTime ? (
                  <DateTimeInput
                    id={id}
                    {...partProps('start')}
                    granularity={timeGranularity}
                    hourCycle={clock}
                    min={boundOf(min, MIDNIGHT)}
                    max={value.end || boundOf(max, LAST_SECOND)}
                  />
                ) : (
                  <DateInput id={id} {...partProps('start')} min={min} max={startMax} />
                )}
              </Field>
              <Field
                label={endLabel}
                className={styles.part}
                error={invalid}
                errorHidden
                disabled={disabled}
                readOnly={readOnly}
              >
                {withTime ? (
                  <DateTimeInput
                    {...partProps('end')}
                    granularity={timeGranularity}
                    hourCycle={clock}
                    min={value.start || boundOf(min, MIDNIGHT)}
                    max={boundOf(max, LAST_SECOND)}
                  />
                ) : (
                  <DateInput {...partProps('end')} min={endMin} max={max} />
                )}
              </Field>
              <Popover.Trigger asChild>
                <IconButton
                  className={styles.trigger}
                  variant="outline"
                  size={size}
                  shape="square"
                  label={labels.openCalendar}
                  icon={<CalendarIcon />}
                  disabled={!interactive}
                />
              </Popover.Trigger>
            </div>
          </Popover.Anchor>
          <Popover.Content
            ref={panelRef}
            className={picker.popover}
            align="end"
            aria-label={labels.openCalendar}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
            }}
          >
            {/* The panel's own controls aren't the fieldset's: no label, error or id from it. */}
            <FieldContext.Provider value={null}>
              <div className={styles.panel}>
                {presets && presets.length > 0 ? (
                  <div role="group" aria-label={labels.presets} className={styles.presets}>
                    {presets.map((preset) => {
                      const range = presetRange(preset)
                      const current = range.start === value.start && range.end === value.end
                      return (
                        <Button
                          key={preset.label}
                          variant="ghost"
                          size="sm"
                          className={styles.preset}
                          aria-pressed={current}
                          onClick={() => {
                            setRange(presetRange(preset))
                            setOpen(false)
                          }}
                        >
                          {preset.label}
                        </Button>
                      )
                    })}
                  </div>
                ) : null}
                <div className={picker.panel}>
                  <Calendar
                    mode="range"
                    months={2}
                    // The panel is a dialog: opening it moves focus to its current day.
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    value={{
                      start: startDate ? formatDate(startDate) : '',
                      end: endDate ? formatDate(endDate) : '',
                    }}
                    min={min}
                    max={max}
                    isDateDisabled={isDateDisabled}
                    firstDayOfWeek={firstDayOfWeek}
                    locale={locale}
                    timeZone={timeZone}
                    labels={labels}
                    onValueChange={pickRange}
                  />
                  {withTime ? (
                    <div className={styles.times}>
                      {(['start', 'end'] as const).map((part) => {
                        const time = timeOf(value[part])
                        return (
                          <div key={part} className={picker.timeRow}>
                            <span className={picker.timeLabel} aria-hidden="true">
                              {part === 'start' ? labels.startTime : labels.endTime}
                            </span>
                            <TimeInput
                              aria-label={part === 'start' ? labels.startTime : labels.endTime}
                              value={time ? formatTime(time, timeGranularity) : ''}
                              granularity={timeGranularity}
                              hourCycle={clock}
                              locale={locale}
                              size="sm"
                              labels={labels}
                              disabled={(part === 'start' ? startDate : endDate) === null}
                              onValueChange={(next) => {
                                setTime(part, next)
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </FieldContext.Provider>
          </Popover.Content>
        </Popover>
      </Fieldset>
    )
  },
)
