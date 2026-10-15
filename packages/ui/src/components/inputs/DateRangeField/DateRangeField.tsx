import {
  forwardRef,
  useRef,
  useState,
  type FocusEvent,
  type FocusEventHandler,
  type HTMLAttributes,
} from 'react'
import { CalendarIcon } from '#icons'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { Button } from '#components/actions/Button'
import { IconButton } from '#components/actions/IconButton'
import { Popover } from '#components/overlays/Popover'
import { Calendar } from '#components/inputs/Calendar'
import { DateInput } from '#components/inputs/DateInput'
import { DateTimeInput } from '#components/inputs/DateTimeInput'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { Fieldset } from '#components/inputs/Fieldset'
import { Input } from '#components/inputs/Input'
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
import styles from './DateRangeField.module.css'

/**
 * Two ISO dates (`YYYY-MM-DD`); `''` for an unset end. With a time `granularity`, each end is a
 * date-time in the same form as {@link DateTimeInput | DateTimeInput}'s value.
 */
export interface DateRangeValue {
  start: string
  end: string
}

/** A range offered beside the calendar: "Last 7 days", "This month". */
export interface DateRangePreset {
  label: string
  /** The range, or a function that works it out when picked (so "today" is always today). */
  value: DateRangeValue | (() => DateRangeValue)
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
  /**
   * `native`: two native date inputs and the platform's own picker. `calendar`: two typed date
   * inputs and one calendar for the whole range, which also takes `granularity` and `presets`.
   *
   * @defaultValue `'calendar'` when `presets` or a time `granularity` is set, otherwise `'native'`
   */
  picker?: 'native' | 'calendar'
  /** With the calendar picker: `day` (default), or `minute`/`second` to give each end a time. */
  granularity?: 'day' | TimeGranularity
  /** With the calendar picker: ranges to offer beside the calendar. */
  presets?: readonly DateRangePreset[]
  /** With the calendar picker: show a clear button in each input. */
  clearable?: boolean
  /** With the calendar picker: marks dates unavailable. */
  isDateDisabled?: (date: string) => boolean
  /** With the calendar picker: 0 (Sunday) to 6 (Saturday). Defaults to the locale's week. */
  firstDayOfWeek?: number
  /** With the calendar picker: BCP 47 locale for the parts and names. Default `en-AU`. */
  locale?: string
  /**
   * With the calendar picker: the zone "today" is read in. With a time `granularity`, each end
   * becomes a UTC instant typed as this zone's clock, as in {@link DateTimeInput | DateTimeInput}.
   */
  timeZone?: string
  /** With a time `granularity`: 12 or 24. Defaults to the locale's clock. */
  hourCycle?: 12 | 24
  /** With the calendar picker: words for another language or wording. */
  labels?: Partial<DateTimeLabels>
}

const EMPTY: DateRangeValue = { start: '', end: '' }
const MIDNIGHT: TimeOfDay = { hour: 0, minute: 0, second: 0 }
const LAST_SECOND: TimeOfDay = { hour: 23, minute: 59, second: 59 }

const resolvePreset = (preset: DateRangePreset): DateRangeValue =>
  typeof preset.value === 'function' ? preset.value() : preset.value

/**
 * A start and end date under one legend: two native date inputs, or typed dates with one
 * calendar for the range, optional times and preset ranges.
 *
 * @remarks
 * By default `DateRangeField` is two native date inputs, side by side and wrapping on a phone,
 * under one legend. Native inputs mean the platform's own date picker and its accessibility.
 *
 * With `picker="calendar"` the two ends are typed like {@link DateInput | DateInput}, and one
 * button opens a two-month {@link Calendar | Calendar}: the first pick sets the start, the second
 * the end. `granularity="minute"` adds a time to each end (a new range runs from the start of its
 * first day to the end of its last), and `presets` lists ranges such as "Last 7 days" beside the
 * calendar. Either one turns the calendar picker on by itself.
 *
 * Whichever picker, the start can't pass the end and the end can't come before the start.
 *
 * @privateRemarks
 * A date range as two native date inputs under one legend, side by side and wrapping
 * when narrow. The start can't pass the end and the end can't come before the start
 * (each input's `min`/`max` follows the other). `id` goes to the start input; the ref to
 * the fieldset. The calendar picker is opt-in, so the native markup and behaviour stay exactly
 * as they were for existing callers.
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
      picker: pickerProp,
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
    const usesCalendar =
      pickerProp === 'calendar' ||
      (pickerProp === undefined && (presets !== undefined || granularity !== 'day'))

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

    if (!usesCalendar) {
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
    }

    /* ─── Calendar picker ─── */
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
                      const range = resolvePreset(preset)
                      const current = range.start === value.start && range.end === value.end
                      return (
                        <Button
                          key={preset.label}
                          variant="ghost"
                          size="sm"
                          className={styles.preset}
                          aria-pressed={current}
                          onClick={() => {
                            setRange(resolvePreset(preset))
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
