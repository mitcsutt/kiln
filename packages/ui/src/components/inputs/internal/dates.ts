/**
 * Date and time helpers shared by Calendar and the date, time and date-time inputs.
 *
 * Values travel as ISO strings (`2026-10-15`, `14:30`, `2026-10-15T14:30`), never `Date`
 * objects. A `CalendarDate` is a civil date with no time zone: arithmetic runs on day numbers
 * through `Date.UTC`, so a daylight-saving change can never move a day. Time zones only matter
 * for an instant (`…Z`), and those go through `Intl.DateTimeFormat` (ADR 0042).
 */

/** A civil date. `month` is 1 to 12. */
export interface CalendarDate {
  year: number
  month: number
  day: number
}

/** A time of day on the 24-hour clock. */
export interface TimeOfDay {
  hour: number
  minute: number
  second: number
}

/** The smallest unit a time value keeps. */
export type TimeGranularity = 'minute' | 'second'

const DAY_MS = 86_400_000
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_RE = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/
const DATE_TIME_RE = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)$/
const ZONED_RE = /(?:Z|[+-]\d{2}:?\d{2})$/i

export const pad = (value: number, length = 2): string => String(value).padStart(length, '0')

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

/** `YYYY-MM-DD` → a date, or `null` when it isn't one (`2026-02-30` isn't). */
export function parseDate(text: string): CalendarDate | null {
  const match = DATE_RE.exec(text)
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

export function formatDate(date: CalendarDate): string {
  return `${pad(date.year, 4)}-${pad(date.month)}-${pad(date.day)}`
}

/** `HH:mm` or `HH:mm:ss` (fractions ignored) → a time, or `null`. */
export function parseTime(text: string): TimeOfDay | null {
  const match = TIME_RE.exec(text)
  if (!match) return null
  const [hour, minute, second] = [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)]
  if (hour > 23 || minute > 59 || second > 59) return null
  return { hour, minute, second }
}

export function formatTime(time: TimeOfDay, granularity: TimeGranularity = 'minute'): string {
  const base = `${pad(time.hour)}:${pad(time.minute)}`
  return granularity === 'second' ? `${base}:${pad(time.second)}` : base
}

/** Days since 1970-01-01. */
export function toDayNumber(date: CalendarDate): number {
  const ms = new Date(0).setUTCFullYear(date.year, date.month - 1, date.day)
  return Math.round(ms / DAY_MS)
}

export function fromDayNumber(days: number): CalendarDate {
  const d = new Date(days * DAY_MS)
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return toDayNumber(a) - toDayNumber(b)
}

export function isSameDay(a: CalendarDate | null | undefined, b: CalendarDate | null | undefined) {
  return a != null && b != null && compareDates(a, b) === 0
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromDayNumber(toDayNumber(date) + days)
}

/** Moves by whole months, keeping the day where the month has it (31 Jan + 1 month = 28 Feb). */
export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const index = date.year * 12 + (date.month - 1) + months
  const year = Math.floor(index / 12)
  const month = (index % 12) + 1
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) }
}

/** 0 (Sunday) to 6 (Saturday). */
export function dayOfWeek(date: CalendarDate): number {
  return (((toDayNumber(date) + 4) % 7) + 7) % 7
}

export function clampDate(
  date: CalendarDate,
  min: CalendarDate | null,
  max: CalendarDate | null,
): CalendarDate {
  if (min && compareDates(date, min) < 0) return min
  if (max && compareDates(date, max) > 0) return max
  return date
}

/* ─── Time zones ─────────────────────────────────────────────────────────── */

const zoneFormats = new Map<string, Intl.DateTimeFormat>()

function zoneFormat(timeZone: string): Intl.DateTimeFormat {
  let format = zoneFormats.get(timeZone)
  if (!format) {
    format = new Intl.DateTimeFormat('en-US', {
      timeZone,
      calendar: 'gregory',
      numberingSystem: 'latn',
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
    zoneFormats.set(timeZone, format)
  }
  return format
}

/** The wall-clock date and time at instant `ms` in `timeZone` (an IANA name or `UTC`). */
export function zonedParts(ms: number, timeZone: string): { date: CalendarDate; time: TimeOfDay } {
  const parts: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {}
  for (const part of zoneFormat(timeZone).formatToParts(ms)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value)
  }
  return {
    date: { year: parts.year ?? 1970, month: parts.month ?? 1, day: parts.day ?? 1 },
    time: { hour: (parts.hour ?? 0) % 24, minute: parts.minute ?? 0, second: parts.second ?? 0 },
  }
}

function wallMs(date: CalendarDate, time: TimeOfDay): number {
  return toDayNumber(date) * DAY_MS + ((time.hour * 60 + time.minute) * 60 + time.second) * 1000
}

/**
 * The instant a wall-clock time in `timeZone` names. A time skipped by a daylight-saving change
 * moves forward with the clocks; a repeated one resolves to its first occurrence.
 */
export function zonedToInstant(date: CalendarDate, time: TimeOfDay, timeZone: string): number {
  const wall = wallMs(date, time)
  const wallAt = (ms: number) => {
    const local = zonedParts(ms, timeZone)
    return wallMs(local.date, local.time)
  }
  // A zone's offset either side of a change: sample a day before, at, and a day after.
  const candidates = [wall - DAY_MS, wall, wall + DAY_MS]
    .map((ms) => wall - (wallAt(ms) - ms))
    .sort((a, b) => a - b)
  // A repeated hour reads true at both instants (take the first); a skipped one at neither
  // (take the later, where the clocks have already moved on).
  return candidates.find((ms) => wallAt(ms) === wall) ?? (candidates[2] as number)
}

/** Today's date, in `timeZone` or the runtime's own zone. */
export function todayIn(timeZone?: string, now: number = Date.now()): CalendarDate {
  if (timeZone) return zonedParts(now, timeZone).date
  const d = new Date(now)
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

/** Whether `timeZone` is one this runtime knows. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    zoneFormat(timeZone)
    return true
  } catch {
    return false
  }
}

/* ─── Date-time values ───────────────────────────────────────────────────── */

export interface DateTimeParts {
  date: CalendarDate
  time: TimeOfDay
}

/**
 * Reads a date-time value. With `timeZone`, the value is an instant: a string with `Z` or an
 * offset is converted to the wall clock there, and one without is taken as that wall clock.
 * Without it, the value is a wall clock (`2026-10-15T14:30`, like `datetime-local`), and an
 * instant is shown in the runtime's own zone.
 */
export function parseDateTime(text: string, timeZone?: string): DateTimeParts | null {
  if (ZONED_RE.test(text) && /^\d{4}-\d{2}-\d{2}T/i.test(text)) {
    const ms = Date.parse(text)
    if (Number.isNaN(ms)) return null
    if (timeZone) return zonedParts(ms, timeZone)
    const d = new Date(ms)
    return {
      date: { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() },
      time: { hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds() },
    }
  }
  const match = DATE_TIME_RE.exec(text)
  if (!match) return null
  const date = parseDate(match[1] ?? '')
  const time = parseTime(match[2] ?? '')
  return date && time ? { date, time } : null
}

/**
 * Writes a date-time value: a wall clock (`2026-10-15T14:30`) without `timeZone`, or the UTC
 * instant (`2026-10-15T03:30:00Z`) that wall clock names in `timeZone`.
 */
export function formatDateTime(
  parts: DateTimeParts,
  granularity: TimeGranularity = 'minute',
  timeZone?: string,
): string {
  if (!timeZone) return `${formatDate(parts.date)}T${formatTime(parts.time, granularity)}`
  const ms = zonedToInstant(parts.date, parts.time, timeZone)
  return `${new Date(ms).toISOString().slice(0, 19)}Z`
}

/** The date part of a date or date-time value, for calendar comparisons. */
export function dateOf(text: string, timeZone?: string): CalendarDate | null {
  return parseDate(text) ?? parseDateTime(text, timeZone)?.date ?? null
}

/* ─── Locale ─────────────────────────────────────────────────────────────── */

export const DEFAULT_LOCALE = 'en-AU'

// Regions whose week starts on Sunday, for runtimes without `Intl.Locale` week info.
const SUNDAY_FIRST = new Set([
  'US', 'CA', 'MX', 'BR', 'JP', 'KR', 'TW', 'HK', 'MO', 'PH', 'IL', 'IN', 'ZA', 'SA',
  'PE', 'CO', 'VE', 'GT', 'HN', 'NI', 'PA', 'PR', 'DO', 'SV', 'KE', 'ET', 'ZW', 'TH',
]) // prettier-ignore

interface WeekInfoLocale {
  getWeekInfo?: () => { firstDay: number }
  weekInfo?: { firstDay: number }
  maximize?: () => { region?: string }
  region?: string
}

/** The first day of the week for `locale`: 0 (Sunday) to 6 (Saturday). */
export function defaultFirstDayOfWeek(locale: string): number {
  try {
    const intlLocale = new Intl.Locale(locale) as unknown as WeekInfoLocale
    const info = intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo
    if (info) return info.firstDay % 7
    const region = intlLocale.maximize?.().region ?? intlLocale.region
    return region && SUNDAY_FIRST.has(region) ? 0 : 1
  } catch {
    return 1
  }
}

/** 12 or 24, from the locale's own clock. */
export function defaultHourCycle(locale: string): 12 | 24 {
  try {
    const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle
    return cycle === 'h11' || cycle === 'h12' ? 12 : 24
  } catch {
    return 24
  }
}

export type DateSegmentType = 'year' | 'month' | 'day'

export type DatePattern = ({ type: DateSegmentType } | { type: 'literal'; value: string })[]

/** The order of day, month and year for `locale`, with the separators between them. */
export function datePattern(locale: string): DatePattern {
  let parts: Intl.DateTimeFormatPart[]
  try {
    parts = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      calendar: 'gregory',
      numberingSystem: 'latn',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(Date.UTC(2026, 10, 22))
  } catch {
    return datePattern(DEFAULT_LOCALE)
  }
  const pattern: DatePattern = []
  for (const part of parts) {
    if (part.type === 'year' || part.type === 'month' || part.type === 'day')
      pattern.push({ type: part.type })
    else if (part.type === 'literal' && pattern.length > 0)
      pattern.push({ type: 'literal', value: part.value.replace(/[‎‏]/g, '') })
  }
  const last = pattern[pattern.length - 1]
  if (last?.type === 'literal' && last.value.trim() === '') pattern.pop()
  return pattern
}

function utcFormat(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', calendar: 'gregory', ...options })
  } catch {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, { timeZone: 'UTC', ...options })
  }
}

function utcMs(date: CalendarDate): number {
  return toDayNumber(date) * DAY_MS
}

/** "October 2026". */
export function formatMonthYear(locale: string, year: number, month: number): string {
  return utcFormat(locale, { year: 'numeric', month: 'long' }).format(
    utcMs({ year, month, day: 1 }),
  )
}

/** "Thursday 15 October 2026": a day's accessible name. */
export function formatFullDate(locale: string, date: CalendarDate): string {
  return utcFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(utcMs(date))
}

/** Seven weekday names starting at `firstDay`, short ("Mon") and long ("Monday"). */
export function weekdayNames(locale: string, firstDay: number): { short: string; long: string }[] {
  const short = utcFormat(locale, { weekday: 'short' })
  const long = utcFormat(locale, { weekday: 'long' })
  // 2026-11-01 is a Sunday.
  return Array.from({ length: 7 }, (_, index) => {
    const ms = utcMs({ year: 2026, month: 11, day: 1 + ((firstDay + index) % 7) })
    return { short: short.format(ms), long: long.format(ms) }
  })
}

/** The locale's AM and PM markers ("am", "pm" in en-AU). */
export function dayPeriodNames(locale: string): [string, string] {
  const format = utcFormat(locale, { hour: 'numeric', hourCycle: 'h12' })
  const read = (hour: number) =>
    format.formatToParts(Date.UTC(2026, 0, 1, hour)).find((part) => part.type === 'dayPeriod')
      ?.value ?? (hour < 12 ? 'AM' : 'PM')
  return [read(9), read(21)]
}

/** A short name for `timeZone` at instant `ms` ("AEDT", "UTC", "GMT+10"). */
export function timeZoneName(locale: string, timeZone: string, ms: number = Date.now()): string {
  try {
    return (
      new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'short' })
        .formatToParts(ms)
        .find((part) => part.type === 'timeZoneName')?.value ?? timeZone
    )
  } catch {
    return timeZone
  }
}
