const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const ISO_TIME = /^(\d{2}):(\d{2})/

/** `2026-10-03` → "3 Oct 2026" (locale order), read as a calendar date (no time-zone drift). */
export function formatDate(value: string | null | undefined, locale?: string): string {
  if (!value) return ''
  const match = ISO_DATE.exec(value)
  if (!match) return value
  const [, y, m, d] = match
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)))
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

/** `14:30` → "14:30" / "2:30 PM" per locale. */
export function formatTime(value: string | null | undefined, locale?: string): string {
  if (!value) return ''
  const match = ISO_TIME.exec(value)
  if (!match) return value
  const [, h, min] = match
  const date = new Date(Date.UTC(1970, 0, 1, Number(h), Number(min)))
  return new Intl.DateTimeFormat(locale, { timeStyle: 'short', timeZone: 'UTC' }).format(date)
}

/** `2026-10-03T14:30` → date + time per locale (wall-clock, no time-zone conversion). */
export function formatDateTime(value: string | null | undefined, locale?: string): string {
  if (!value) return ''
  const [datePart = '', timePart = ''] = value.split('T')
  if (!ISO_DATE.test(datePart) || !ISO_TIME.test(timePart)) return value
  return `${formatDate(datePart, locale)}, ${formatTime(timePart, locale)}`
}
