import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  type FocusEventHandler,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { CalendarIcon, CloseIcon } from '#icons'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { Popover } from '#components/overlays/Popover'
import { Calendar } from '#components/inputs/Calendar'
import { TimeInput } from '#components/inputs/TimeInput'
import { useControllableState } from '#components/inputs/Combobox/useControllableState'
import {
  FieldContext,
  markFieldAware,
  useResolvedField,
} from '#components/inputs/internal/FieldContext'
import { useMergedRefs } from '#components/inputs/internal/refs'
import {
  DateSegments,
  draftDate,
  draftFromParts,
  draftTime,
  segmentPattern,
  useSegmentDraft,
  type Draft,
} from '#components/inputs/internal/DateSegments'
import {
  DEFAULT_LOCALE,
  dateOf,
  dayPeriodNames,
  defaultHourCycle,
  formatDate,
  formatDateTime,
  formatTime,
  parseDate,
  parseDateTime,
  parseTime,
  timeZoneName,
  todayIn,
  zonedParts,
  zonedToInstant,
  type DateTimeParts,
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

export interface DateTimeInputProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'onBlur' | 'onFocus'
> {
  /**
   * `YYYY-MM-DDTHH:mm` (a wall-clock time, like `datetime-local`), or with `timeZone` the UTC
   * instant `YYYY-MM-DDTHH:mm:ssZ`. `''` until every part is filled in.
   */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /**
   * Makes the value an instant: it's shown and typed as the wall clock in this zone (an IANA
   * name such as `Australia/Perth`, or `UTC`) and reported in UTC. The zone's short name shows
   * in the box.
   */
  timeZone?: string
  /** `minute` (default) or `second`: the smallest part shown and kept. */
  granularity?: TimeGranularity
  /** 12 (with am/pm) or 24. Defaults to the locale's own clock. */
  hourCycle?: 12 | 24
  /** Earliest date-time, in the same form as `value`. Earlier days can't be picked. */
  min?: string
  /** Latest date-time, in the same form as `value`. */
  max?: string
  /** Marks dates unavailable, in the calendar and when typed. */
  isDateDisabled?: (date: string) => boolean
  /** 0 (Sunday) to 6 (Saturday). Defaults to the locale's own week. */
  firstDayOfWeek?: number
  /** BCP 47 locale for the order of the parts, the clock and the calendar. Default `en-AU`. */
  locale?: string
  /** Show the calendar button. Default `true`. */
  calendar?: boolean
  /** Show a clear button while there's a value. */
  clearable?: boolean
  /** Submits the value (`''` when incomplete). */
  name?: string
  form?: string
  size?: Size
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Critical border + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Fires once focus leaves the whole control, calendar included. */
  onBlur?: FocusEventHandler<HTMLElement>
  onFocus?: FocusEventHandler<HTMLElement>
  labels?: Partial<DateTimeLabels>
}

/** Milliseconds for ordering two values in the same zone. */
function instantOf(text: string | undefined, timeZone?: string): number | null {
  const parts = parseDateTime(text ?? '', timeZone)
  if (!parts) return null
  return timeZone
    ? zonedToInstant(parts.date, parts.time, timeZone)
    : Date.UTC(
        parts.date.year,
        parts.date.month - 1,
        parts.date.day,
        parts.time.hour,
        parts.time.minute,
        parts.time.second,
      )
}

/** Whether a date-time `value` falls outside `min`/`max` or on a disabled date. */
export function isDateTimeOutOfRange(
  value: string,
  {
    min,
    max,
    isDateDisabled,
    timeZone,
  }: {
    min?: string
    max?: string
    isDateDisabled?: (date: string) => boolean
    timeZone?: string
  },
): boolean {
  const at = instantOf(value, timeZone)
  if (at === null) return false
  const lower = instantOf(min, timeZone)
  const upper = instantOf(max, timeZone)
  const date = dateOf(value, timeZone)
  return (
    (lower !== null && at < lower) ||
    (upper !== null && at > upper) ||
    (date !== null && (isDateDisabled?.(formatDate(date)) ?? false))
  )
}

/**
 * A date and a time typed part by part, with a calendar and the time together in one panel.
 *
 * @remarks
 * `DateTimeInput` holds a moment as an ISO string. Without `timeZone` it's a wall-clock time
 * (`2026-10-15T14:30`), the same as a native `datetime-local`: right for "the meeting is at 2:30"
 * wherever the reader is. With `timeZone` it's an instant (`2026-10-15T03:30:00Z`), shown and typed
 * as the clock in that zone, with the zone's name in the box: right for logs, deadlines and
 * anything stored as a timestamp.
 *
 * The parts type like {@link DateInput | DateInput} and {@link TimeInput | TimeInput}. The
 * calendar button opens a {@link Calendar | Calendar} with the time beneath it; picking a day keeps
 * the time (or starts at midnight), and the panel stays open to set the time. For the usual
 * labelled field, use {@link DateTimeField | DateTimeField}.
 *
 * @privateRemarks
 * One draft holds the date and time; the panel's Calendar and TimeInput are views of it. A
 * zoned value is converted to wall time on the way in (`parseDateTime`) and back to UTC on the
 * way out (`formatDateTime`), so the parts always show the zone's clock. The ref goes to the box.
 *
 * <DateTimeInput timeZone="UTC" value={publishAt} onValueChange={setPublishAt} />
 */
export const DateTimeInput = markFieldAware(
  forwardRef<HTMLDivElement, DateTimeInputProps>(function DateTimeInput(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      timeZone,
      granularity = 'minute',
      hourCycle: hourCycleProp,
      min,
      max,
      isDateDisabled,
      firstDayOfWeek,
      locale = DEFAULT_LOCALE,
      calendar = true,
      clearable = false,
      name,
      form,
      size = 'md',
      id: idProp,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      required: requiredProp,
      invalid: invalidProp,
      open: openProp,
      defaultOpen,
      onOpenChange,
      onBlur,
      onFocus,
      onKeyDown,
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
    const autoId = useId()
    const rootRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const composedRef = useMergedRefs(ref, rootRef)
    const hourCycle = hourCycleProp ?? defaultHourCycle(locale)
    const pattern = useMemo(
      () => segmentPattern('datetime', locale, granularity, hourCycle),
      [locale, granularity, hourCycle],
    )
    const periodNames = useMemo(() => dayPeriodNames(locale), [locale])
    const [value, setValue] = useControllableState(valueProp, defaultValue ?? '', onValueChange)
    const [open, setOpen] = useControllableState(openProp, defaultOpen ?? false, onOpenChange)

    const toDraft = (text: string): Draft => {
      const parts = parseDateTime(text, timeZone)
      return parts ? draftFromParts(parts.date, parts.time) : {}
    }
    const toValue = (parts: DateTimeParts) => formatDateTime(parts, granularity, timeZone)
    const fromDraft = (draft: Draft): string => {
      const date = draftDate(draft)
      const time = draftTime(draft)
      if (!date || !time || (granularity === 'second' && draft.second === undefined)) return ''
      return toValue({ date, time: granularity === 'minute' ? { ...time, second: 0 } : time })
    }
    const [draft, setDraft] = useSegmentDraft(value, toDraft, fromDraft, setValue)
    const interactive = !field.disabled && !field.readOnly
    const invalid =
      field.invalid || isDateTimeOutOfRange(value, { min, max, isDateDisabled, timeZone })
    const hasEntry = Object.keys(draft).length > 0
    const nowParts = timeZone
      ? zonedParts(Date.now(), timeZone)
      : { date: todayIn(), time: { hour: new Date().getHours(), minute: 0, second: 0 } }
    const reference = draftFromParts(nowParts.date, nowParts.time)
    const instant = instantOf(value, timeZone)
    const zone = timeZone ? timeZoneName(locale, timeZone, instant ?? Date.now()) : null
    const minDate = min ? dateOf(min, timeZone) : null
    const maxDate = max ? dateOf(max, timeZone) : null
    const timeLabelId = `${autoId}-time`

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return
      if (calendar && interactive && event.altKey && event.key === 'ArrowDown') {
        event.preventDefault()
        setOpen(true)
      }
    }

    const draftDateText = (() => {
      const date = draftDate(draft)
      return date ? formatDate(date) : ''
    })()
    const draftTimeText = (() => {
      const time = draftTime(draft)
      return time ? formatTime(time, granularity) : ''
    })()

    const box = (
      // The group only routes what its parts don't handle: a click on its padding, and
      // Alt + Down Arrow from any part to open the calendar.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
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
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          if (isLeaving(event, rootRef, panelRef)) onFocus?.(event)
        }}
        onBlur={(event) => {
          if (isLeaving(event, rootRef, panelRef)) onBlur?.(event)
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
        {zone || (clearable && interactive && hasEntry) || calendar ? (
          <span className={picker.trailing}>
            {zone ? <span className={picker.zone}>{zone}</span> : null}
            {clearable && interactive && hasEntry ? (
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
            ) : null}
            {calendar ? (
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className={picker.button}
                  aria-label={labels.openCalendar}
                  disabled={!interactive}
                >
                  <CalendarIcon />
                </button>
              </Popover.Trigger>
            ) : null}
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

    if (!calendar) return box

    return (
      <Popover open={open && interactive} onOpenChange={setOpen}>
        <Popover.Anchor asChild>{box}</Popover.Anchor>
        <Popover.Content
          ref={panelRef}
          className={picker.popover}
          align="start"
          aria-label={labels.openCalendar}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
          }}
        >
          {/* The panel's time box isn't the field's control: no label, error or id from it. */}
          <FieldContext.Provider value={null}>
            <div className={picker.panel}>
              <Calendar
                // The panel is a dialog: opening it moves focus to its current day.
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                value={parseDate(draftDateText) ? draftDateText : ''}
                min={minDate ? formatDate(minDate) : undefined}
                max={maxDate ? formatDate(maxDate) : undefined}
                isDateDisabled={isDateDisabled}
                firstDayOfWeek={firstDayOfWeek}
                locale={locale}
                timeZone={timeZone}
                labels={labels}
                onValueChange={(next) => {
                  const date = parseDate(next)
                  if (date) setDraft({ hour: 0, minute: 0, second: 0, ...draft, ...date })
                }}
              />
              <div className={picker.timeRow}>
                <span id={timeLabelId} className={picker.timeLabel}>
                  {labels.time}
                </span>
                <TimeInput
                  aria-labelledby={timeLabelId}
                  value={draftTimeText}
                  granularity={granularity}
                  hourCycle={hourCycle}
                  locale={locale}
                  size="sm"
                  labels={labels}
                  onValueChange={(next) => {
                    const time = parseTime(next)
                    if (time) setDraft({ ...draft, ...time })
                  }}
                />
              </div>
            </div>
          </FieldContext.Provider>
        </Popover.Content>
      </Popover>
    )
  }),
)
