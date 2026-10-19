import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '#icons'
import { cx } from '#utils/cx'
import { IconButton } from '#components/actions/IconButton'
import type { DateRangeValue } from '#components/inputs/DateRangeField'
import { useMergedRefs } from '#components/inputs/internal/refs'
import { useLatest } from '#components/inputs/internal/useLatest'
import {
  DEFAULT_LOCALE,
  addDays,
  addMonths,
  clampDate,
  compareDates,
  dayOfWeek,
  daysInMonth,
  defaultFirstDayOfWeek,
  formatDate,
  formatFullDate,
  formatMonthYear,
  isSameDay,
  pad,
  parseDate,
  todayIn,
  weekdayNames,
  type CalendarDate,
} from '#components/inputs/internal/dates'
import styles from './Calendar.module.css'

/** Accessible names of the calendar's own buttons. */
export interface CalendarLabels {
  /** Default `'Previous month'`. */
  previousMonth: string
  /** Default `'Next month'`. */
  nextMonth: string
}

const DEFAULT_LABELS: CalendarLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
}

interface CalendarCommonProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Earliest date that can be picked (`YYYY-MM-DD`). */
  min?: string
  /** Latest date that can be picked (`YYYY-MM-DD`). */
  max?: string
  /** Marks other dates unavailable: weekends, public holidays, booked nights. */
  isDateDisabled?: (date: string) => boolean
  /** 0 (Sunday) to 6 (Saturday). Defaults to the locale's own week. */
  firstDayOfWeek?: number
  /** BCP 47 locale for month and weekday names. Default `en-AU`. */
  locale?: string
  /** The zone "today" is read in. Defaults to the device's. */
  timeZone?: string
  /** How many months to show side by side (they wrap when narrow). Default `1`. */
  months?: 1 | 2
  /** The first month shown (`YYYY-MM`). Controlled. */
  month?: string
  /** The first month shown at first (`YYYY-MM`). Defaults to the selected or current month. */
  defaultMonth?: string
  onMonthChange?: (month: string) => void
  disabled?: boolean
  /** Dates can be focused and read but not picked. */
  readOnly?: boolean
  /** Focus the current day once mounted, as a picker's popover does. */
  autoFocus?: boolean
  labels?: Partial<CalendarLabels>
}

export interface CalendarSingleProps extends CalendarCommonProps {
  /** `single` (default) picks one date; `range` picks a start and an end. */
  mode?: 'single'
  /** `YYYY-MM-DD`, or `''` for none. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export interface CalendarRangeProps extends CalendarCommonProps {
  mode: 'range'
  /** The first click sets `start` (and clears `end`), the second sets `end`. */
  value?: DateRangeValue
  defaultValue?: DateRangeValue
  onValueChange?: (value: DateRangeValue) => void
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps

interface Month {
  year: number
  month: number
}

const monthIndex = (m: Month) => m.year * 12 + m.month - 1
const monthFromIndex = (index: number): Month => ({
  year: Math.floor(index / 12),
  month: (index % 12) + 1,
})
const parseMonth = (text: string | undefined): Month | null => {
  const match = text ? /^(\d{4})-(\d{2})$/.exec(text) : null
  if (!match) return null
  const month = Number(match[2])
  return month >= 1 && month <= 12 ? { year: Number(match[1]), month } : null
}
const formatMonth = (m: Month) => `${pad(m.year, 4)}-${pad(m.month)}`

/** Six rows of seven: every month the same height, so a popover never jumps. */
function monthGrid(month: Month, firstDay: number): (CalendarDate | null)[][] {
  const first = { year: month.year, month: month.month, day: 1 }
  const offset = (dayOfWeek(first) - firstDay + 7) % 7
  const length = daysInMonth(month.year, month.month)
  return Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => {
      const day = row * 7 + column - offset + 1
      return day >= 1 && day <= length ? { ...first, day } : null
    }),
  )
}

/**
 * A month grid for picking a date or a range, with the full keyboard of a date grid.
 *
 * @remarks
 * `Calendar` shows one or two months as a grid of days. Click a day or move with the arrow keys
 * and press Enter. In `range` mode the first pick is the start and the second the end, with the
 * days between shaded as you go. `min`, `max` and `isDateDisabled` mark days that can't be picked;
 * they stay focusable, so a screen reader can still say why a date is missing. Month and weekday
 * names come from `locale`, and so does the first day of the week unless you set
 * `firstDayOfWeek`.
 *
 * {@link DateInput | DateInput}, {@link DateTimeInput | DateTimeInput} and
 * {@link DateRangePickerField | DateRangePickerField} open it in a popover. Use it on its own for a calendar
 * that's always visible, such as a booking page.
 *
 * ## Keyboard
 *
 * | Key | Moves to |
 * | --- | --- |
 * | Arrow keys | The previous or next day, or the same day in the previous or next week |
 * | Home / End | The first or last day of the week |
 * | Page Up / Page Down | The same day in the previous or next month |
 * | Shift + Page Up / Page Down | The same day in the previous or next year |
 * | Enter / Space | Picks the focused day |
 *
 * @privateRemarks
 * ARIA grid pattern: one `<table role="grid">` per month, labelled by its title, with a roving
 * tabindex on the day cells (the focused date is the only tab stop). Cells outside the month are
 * empty, so two months side by side never show a date twice. Values are ISO strings; all date
 * maths goes through `internal/dates` (ADR 0042).
 *
 * <Calendar mode="range" months={2} value={stay} onValueChange={setStay} />
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    mode = 'single',
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    isDateDisabled,
    firstDayOfWeek,
    locale = DEFAULT_LOCALE,
    timeZone,
    months = 1,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    disabled = false,
    readOnly = false,
    autoFocus = false,
    labels: labelsProp,
    className,
    ...rest
  } = props as CalendarCommonProps & {
    mode?: 'single' | 'range'
    value?: string | DateRangeValue
    defaultValue?: string | DateRangeValue
    onValueChange?: (value: string & DateRangeValue) => void
  }
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const autoId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const composedRef = useMergedRefs(ref, rootRef)
  const onValueChangeRef = useLatest(onValueChange)

  const [internal, setInternal] = useState(defaultValue ?? (mode === 'range' ? EMPTY_RANGE : ''))
  const value = valueProp ?? internal
  const range =
    typeof value === 'string'
      ? { start: parseDate(value), end: parseDate(value) }
      : { start: parseDate(value.start), end: parseDate(value.end) }
  const minDate = parseDate(min ?? '')
  const maxDate = parseDate(max ?? '')
  const today = todayIn(timeZone)
  const firstDay = (firstDayOfWeek ?? defaultFirstDayOfWeek(locale)) % 7
  const interactive = !disabled && !readOnly

  const [focused, setFocused] = useState<CalendarDate>(() =>
    clampDate(range.start ?? today, minDate, maxDate),
  )
  const [internalMonth, setInternalMonth] = useState<Month>(
    () => parseMonth(defaultMonth) ?? { year: focused.year, month: focused.month },
  )
  const visible = parseMonth(monthProp) ?? internalMonth
  const [hovered, setHovered] = useState<CalendarDate | null>(null)
  const shouldFocus = useRef(autoFocus)

  const setMonth = (next: Month) => {
    if (monthIndex(next) === monthIndex(visible)) return
    if (monthProp === undefined) setInternalMonth(next)
    onMonthChange?.(formatMonth(next))
  }

  const isUnavailable = (date: CalendarDate) =>
    (minDate !== null && compareDates(date, minDate) < 0) ||
    (maxDate !== null && compareDates(date, maxDate) > 0) ||
    (isDateDisabled?.(formatDate(date)) ?? false)

  // Keep the focused date on screen: arrowing past the last visible month turns the page.
  const moveFocus = (next: CalendarDate) => {
    const date = clampDate(next, minDate, maxDate)
    const first = monthIndex(visible)
    const index = monthIndex(date)
    if (index < first) setMonth(monthFromIndex(index))
    else if (index > first + months - 1) setMonth(monthFromIndex(index - months + 1))
    shouldFocus.current = true
    setFocused(date)
  }

  // A controlled month moving elsewhere takes the focused date with it.
  const firstVisible = monthIndex(visible)
  const focusedIndex = monthIndex(focused)
  if (focusedIndex < firstVisible || focusedIndex > firstVisible + months - 1) {
    const day = Math.min(focused.day, daysInMonth(visible.year, visible.month))
    const date = clampDate({ ...visible, day }, minDate, maxDate)
    const index = monthIndex(date)
    setFocused(
      index < firstVisible || index > firstVisible + months - 1 ? { ...visible, day } : date,
    )
  }

  useEffect(() => {
    if (!shouldFocus.current) return
    shouldFocus.current = false
    rootRef.current?.querySelector<HTMLElement>(`[data-date="${formatDate(focused)}"]`)?.focus()
  }, [focused, visible])

  const select = (date: CalendarDate) => {
    setFocused(date)
    if (!interactive || isUnavailable(date)) return
    const iso = formatDate(date)
    let next: string | DateRangeValue
    if (mode === 'single') {
      next = iso
    } else if (!range.start || range.end) {
      next = { start: iso, end: '' }
    } else if (compareDates(date, range.start) < 0) {
      next = { start: iso, end: formatDate(range.start) }
    } else {
      next = { start: formatDate(range.start), end: iso }
    }
    if (valueProp === undefined) setInternal(next)
    onValueChangeRef.current?.(next as string & DateRangeValue)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false
    const ahead = rtl ? -1 : 1
    const weekStart = (dayOfWeek(focused) - firstDay + 7) % 7
    const moves: Record<string, () => CalendarDate> = {
      ArrowLeft: () => addDays(focused, -ahead),
      ArrowRight: () => addDays(focused, ahead),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekStart),
      End: () => addDays(focused, 6 - weekStart),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    }
    const move = moves[event.key]
    if (move) {
      event.preventDefault()
      const next = move()
      moveFocus(next)
      if (mode === 'range') setHovered(next)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(focused)
    }
  }

  const turnPage = (step: 1 | -1) => {
    const next = monthFromIndex(monthIndex(visible) + step)
    setMonth(next)
    const target = monthIndex(focused) + step
    const targetMonth = monthFromIndex(target)
    setFocused(
      clampDate(
        {
          ...targetMonth,
          day: Math.min(focused.day, daysInMonth(targetMonth.year, targetMonth.month)),
        },
        minDate,
        maxDate,
      ),
    )
  }

  // The shaded span: the chosen range, or start → the hovered day while the end is pending.
  const pending = mode === 'range' && range.start !== null && range.end === null
  let spanStart = mode === 'range' ? range.start : null
  let spanEnd = mode === 'range' ? range.end : null
  if (pending && hovered && range.start) {
    ;[spanStart, spanEnd] =
      compareDates(hovered, range.start) < 0 ? [hovered, range.start] : [range.start, hovered]
  }

  const weekdays = weekdayNames(locale, firstDay)
  const visibleMonths = Array.from({ length: months }, (_, i) =>
    monthFromIndex(monthIndex(visible) + i),
  )
  const canGoBack = !minDate || monthIndex(visible) > monthIndex(minDate)
  const canGoForward = !maxDate || monthIndex(visible) + months - 1 < monthIndex(maxDate)

  return (
    <div
      ref={composedRef}
      role="group"
      className={cx(styles.root, className)}
      data-mode={mode}
      data-months={months}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      <div className={styles.months}>
        {visibleMonths.map((month, monthNumber) => {
          const titleId = `${autoId}-title-${String(monthNumber)}`
          const last = monthNumber === months - 1
          return (
            <div key={formatMonth(month)} className={styles.month}>
              <div className={styles.header}>
                <div id={titleId} className={styles.title} aria-live="polite">
                  {formatMonthYear(locale, month.year, month.month)}
                </div>
                {last ? (
                  <div className={styles.nav}>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      label={labels.previousMonth}
                      icon={<ChevronLeftIcon />}
                      disabled={disabled || !canGoBack}
                      onClick={() => {
                        turnPage(-1)
                      }}
                    />
                    <IconButton
                      variant="ghost"
                      size="sm"
                      label={labels.nextMonth}
                      icon={<ChevronRightIcon />}
                      disabled={disabled || !canGoForward}
                      onClick={() => {
                        turnPage(1)
                      }}
                    />
                  </div>
                ) : null}
              </div>
              <table role="grid" className={styles.grid} aria-labelledby={titleId}>
                <thead>
                  <tr>
                    {weekdays.map((weekday) => (
                      <th
                        key={weekday.long}
                        scope="col"
                        abbr={weekday.long}
                        className={styles.weekday}
                      >
                        {weekday.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthGrid(month, firstDay).map((week, row) => (
                    <tr key={row}>
                      {week.map((date, column) => {
                        if (!date)
                          return <td key={column} role="gridcell" className={styles.empty} />
                        const iso = formatDate(date)
                        const unavailable = isUnavailable(date)
                        const isStart = isSameDay(date, spanStart)
                        const isEnd = isSameDay(date, spanEnd)
                        const inSpan =
                          spanStart !== null &&
                          spanEnd !== null &&
                          compareDates(date, spanStart) >= 0 &&
                          compareDates(date, spanEnd) <= 0
                        const selected =
                          mode === 'single'
                            ? isSameDay(date, range.start)
                            : isSameDay(date, range.start) ||
                              isSameDay(date, range.end) ||
                              (!pending && inSpan)
                        const isFocused = isSameDay(date, focused)
                        return (
                          <td
                            key={column}
                            role="gridcell"
                            className={styles.day}
                            data-date={iso}
                            tabIndex={disabled ? undefined : isFocused ? 0 : -1}
                            aria-label={formatFullDate(locale, date)}
                            aria-selected={selected}
                            aria-disabled={disabled || unavailable || undefined}
                            aria-current={isSameDay(date, today) ? 'date' : undefined}
                            data-today={isSameDay(date, today) || undefined}
                            data-selected={selected || undefined}
                            data-unavailable={unavailable || undefined}
                            data-range-start={(inSpan && isStart) || undefined}
                            data-range-end={(inSpan && isEnd) || undefined}
                            data-in-range={inSpan || undefined}
                            data-preview={(pending && inSpan) || undefined}
                            onClick={() => {
                              select(date)
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                              if (!isFocused) setFocused(date)
                            }}
                            onPointerEnter={() => {
                              if (pending) setHovered(date)
                            }}
                          >
                            <span className={styles.dayText}>{date.day}</span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
})

const EMPTY_RANGE: DateRangeValue = { start: '', end: '' }
