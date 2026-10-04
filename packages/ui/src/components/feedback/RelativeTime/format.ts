export type RelativeTimeStyle = 'long' | 'short' | 'narrow'

type Unit = Intl.RelativeTimeFormatUnit

const STEPS: [limit: number, unit: Unit, size: number][] = [
  [45, 'second', 1],
  [45 * 60, 'minute', 60],
  [22 * 3600, 'hour', 3600],
  [26 * 86400, 'day', 86400],
  [320 * 86400, 'month', 30.44 * 86400],
  [Infinity, 'year', 365.25 * 86400],
]

export function toDate(date: Date | string | number): Date {
  return date instanceof Date ? date : new Date(date)
}

/**
 * "3 mins ago", "in 2 hours", "yesterday". Pure; exported for places that need the
 * string without the element (a tooltip, a toast).
 * Anything under 45 seconds reads as "now".
 */
export function formatRelativeTime(
  date: Date | string | number,
  now: number = Date.now(),
  locale = 'en-AU',
  format: RelativeTimeStyle = 'short',
): string {
  const seconds = (toDate(date).getTime() - now) / 1000
  const abs = Math.abs(seconds)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: format })
  for (const [limit, unit, size] of STEPS) {
    if (abs < limit) {
      const value = unit === 'second' ? 0 : Math.round(seconds / size)
      return rtf.format(value, unit)
    }
  }
  return rtf.format(0, 'second')
}

/** "Monday 28 September 2026 at 2:05 pm" — used for the tooltip and the first render. */
export function formatAbsoluteTime(date: Date | string | number, locale = 'en-AU'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(
    toDate(date),
  )
}
