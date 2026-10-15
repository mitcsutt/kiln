/**
 * How a chart writes its values, in the tooltip, the axis, the legend and the data table:
 *
 * - `number`: grouped digits, up to two decimals (`12,480.5`). The default.
 * - `integer`: rounded to whole numbers (`12,481`).
 * - `compact`: short forms for big numbers (`12K`, `3.4M`).
 * - `percent`: a fraction as a percentage (`0.125` reads `12.5%`).
 * - any `Intl.NumberFormatOptions`, such as `{ style: 'currency', currency: 'EUR' }`;
 * - or a function from the value to its text.
 *
 * Everything goes through `Intl.NumberFormat` in the chart's `locale`.
 */
export type ValueFormat =
  | 'number'
  | 'integer'
  | 'compact'
  | 'percent'
  | Intl.NumberFormatOptions
  | ((value: number) => string)

/**
 * How a chart writes its x values when they're dates: `date` (`3 Mar`), `month` (`Mar 2026`),
 * `year`, `weekday` (`Tue`), `time` (`14:30`), `datetime`, any `Intl.DateTimeFormatOptions`, or a
 * function from the date to its text. Text and number x values print as they are unless you pass a
 * function.
 *
 * A date string with no offset (`2026-03-01`, `2026-03-01T14:30`) is a wall-clock time, not an
 * instant: it prints as written, in every time zone. `timeZone` applies only to instants: `Date`
 * objects and strings with `Z` or an offset (`2026-03-01T14:30Z`, `2026-03-01T14:30+10:00`).
 */
export type XFormat =
  | 'date'
  | 'month'
  | 'year'
  | 'weekday'
  | 'time'
  | 'datetime'
  | Intl.DateTimeFormatOptions
  | ((value: Date) => string)

/** Where formatting happens: the chart's `locale` and `timeZone`, both passed to `Intl`. */
export interface FormatLocale {
  locale?: string | undefined
  /** The zone instants print in. A date string with no offset prints as written, in any zone. */
  timeZone?: string | undefined
}

const NUMBER_PRESETS: Record<Exclude<ValueFormat, object>, Intl.NumberFormatOptions> = {
  number: { maximumFractionDigits: 2 },
  integer: { maximumFractionDigits: 0 },
  compact: { notation: 'compact', maximumFractionDigits: 1 },
  percent: { style: 'percent', maximumFractionDigits: 1 },
}

const DATE_PRESETS: Record<Exclude<XFormat, object>, Intl.DateTimeFormatOptions> = {
  date: { day: 'numeric', month: 'short' },
  month: { month: 'short', year: 'numeric' },
  year: { year: 'numeric' },
  weekday: { weekday: 'short' },
  time: { hour: 'numeric', minute: '2-digit' },
  datetime: { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' },
}

const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>()

function numberFormat(options: Intl.NumberFormatOptions, locale?: string): Intl.NumberFormat {
  const key = `n|${locale ?? ''}|${JSON.stringify(options)}`
  let format = cache.get(key)
  if (!(format instanceof Intl.NumberFormat)) {
    format = new Intl.NumberFormat(locale, options)
    cache.set(key, format)
  }
  return format
}

function dateFormat(options: Intl.DateTimeFormatOptions, locale?: string): Intl.DateTimeFormat {
  const key = `d|${locale ?? ''}|${JSON.stringify(options)}`
  let format = cache.get(key)
  if (!(format instanceof Intl.DateTimeFormat)) {
    format = new Intl.DateTimeFormat(locale, options)
    cache.set(key, format)
  }
  return format
}

/** A function that writes one value in `format`. Missing values read as an en dash. */
export function valueFormatter(
  format: ValueFormat = 'number',
  { locale }: FormatLocale = {},
): (value: unknown) => string {
  if (typeof format === 'function') {
    return (value) => (typeof value === 'number' && Number.isFinite(value) ? format(value) : '–')
  }
  const options = typeof format === 'string' ? NUMBER_PRESETS[format] : format
  const intl = numberFormat(options, locale)
  return (value) => (typeof value === 'number' && Number.isFinite(value) ? intl.format(value) : '–')
}

/** A function that writes one x value: dates in `format`, anything else as text. */
export function xFormatter(
  format: XFormat | undefined,
  { locale, timeZone }: FormatLocale = {},
): (value: unknown) => string {
  const custom = typeof format === 'function' ? format : undefined
  const options =
    format === undefined || typeof format === 'function'
      ? DATE_PRESETS.date
      : typeof format === 'string'
        ? DATE_PRESETS[format]
        : format
  const intl = dateFormat({ ...options, ...(timeZone ? { timeZone } : {}) }, locale)
  // A date string with no offset is a wall-clock time, not an instant: `toDate` reads it in UTC,
  // so it prints as written on the server and in every visitor's zone.
  const wallClock = dateFormat({ ...options, timeZone: 'UTC' }, locale)
  return (value) => {
    const date = toDate(value)
    if (date) {
      if (custom) return custom(date)
      return (typeof value === 'string' && !OFFSET.test(value) ? wallClock : intl).format(date)
    }
    if (value === null || value === undefined) return ''
    return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
  }
}

const OFFSET = /(Z|[+-]\d{2}:?\d{2})$/
const ISO_DATE = /^\d{4}-\d{2}(-\d{2})?([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/

/**
 * A date for a `Date` or an ISO 8601 date string; anything else is not a date. A string with no
 * offset is read in UTC, so it means the same instant in every runtime.
 */
export function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value
  if (typeof value === 'string' && ISO_DATE.test(value)) {
    const iso = value.replace(' ', 'T')
    const date = new Date(OFFSET.test(iso) || !iso.includes('T') ? iso : `${iso}Z`)
    return Number.isNaN(date.getTime()) ? undefined : date
  }
  return undefined
}
