import {
  addDays,
  addMonths,
  datePattern,
  dayOfWeek,
  dayPeriodNames,
  daysInMonth,
  defaultFirstDayOfWeek,
  defaultHourCycle,
  formatDate,
  formatDateTime,
  formatFullDate,
  formatMonthYear,
  formatTime,
  parseDate,
  parseDateTime,
  parseTime,
  todayIn,
  weekdayNames,
  zonedParts,
  zonedToInstant,
} from './dates'

describe('dates', () => {
  it('parses and formats ISO dates, rejecting impossible ones', () => {
    expect(parseDate('2026-10-15')).toEqual({ year: 2026, month: 10, day: 15 })
    expect(parseDate('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 })
    expect(parseDate('2026-02-29')).toBeNull()
    expect(parseDate('2026-13-01')).toBeNull()
    expect(parseDate('15/10/2026')).toBeNull()
    expect(formatDate({ year: 26, month: 3, day: 4 })).toBe('0026-03-04')
  })

  it('parses and formats times at minute or second granularity', () => {
    expect(parseTime('14:30')).toEqual({ hour: 14, minute: 30, second: 0 })
    expect(parseTime('09:05:07.250')).toEqual({ hour: 9, minute: 5, second: 7 })
    expect(parseTime('24:00')).toBeNull()
    expect(formatTime({ hour: 9, minute: 5, second: 7 })).toBe('09:05')
    expect(formatTime({ hour: 9, minute: 5, second: 7 }, 'second')).toBe('09:05:07')
  })

  it('does calendar arithmetic without drifting across months or leap years', () => {
    expect(daysInMonth(2026, 2)).toBe(28)
    expect(daysInMonth(2000, 2)).toBe(29)
    expect(daysInMonth(1900, 2)).toBe(28)
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({ year: 2027, month: 1, day: 1 })
    expect(addDays({ year: 2026, month: 3, day: 1 }, -1)).toEqual({ year: 2026, month: 2, day: 28 })
    expect(addMonths({ year: 2026, month: 1, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    })
    expect(addMonths({ year: 2026, month: 1, day: 15 }, -2)).toEqual({
      year: 2025,
      month: 11,
      day: 15,
    })
    // 15 October 2026 is a Thursday.
    expect(dayOfWeek({ year: 2026, month: 10, day: 15 })).toBe(4)
  })

  it('converts between instants and wall clocks in a zone', () => {
    const ms = Date.UTC(2026, 9, 15, 3, 30)
    expect(zonedParts(ms, 'Australia/Sydney')).toEqual({
      date: { year: 2026, month: 10, day: 15 },
      time: { hour: 14, minute: 30, second: 0 },
    })
    expect(
      zonedToInstant(
        { year: 2026, month: 10, day: 15 },
        { hour: 14, minute: 30, second: 0 },
        'Australia/Sydney',
      ),
    ).toBe(ms)
  })

  it('resolves a skipped hour forward and a repeated hour to its first occurrence', () => {
    // Sydney skips 02:00–03:00 on 4 October 2026 and repeats 02:00–03:00 on 5 April 2026.
    const skipped = zonedToInstant(
      { year: 2026, month: 10, day: 4 },
      { hour: 2, minute: 30, second: 0 },
      'Australia/Sydney',
    )
    expect(zonedParts(skipped, 'Australia/Sydney').time).toEqual({ hour: 3, minute: 30, second: 0 })
    const repeated = zonedToInstant(
      { year: 2026, month: 4, day: 5 },
      { hour: 2, minute: 30, second: 0 },
      'Australia/Sydney',
    )
    expect(new Date(repeated).toISOString()).toBe('2026-04-04T15:30:00.000Z')
  })

  it('reads wall-clock and zoned date-time values', () => {
    expect(parseDateTime('2026-10-15T14:30')).toEqual({
      date: { year: 2026, month: 10, day: 15 },
      time: { hour: 14, minute: 30, second: 0 },
    })
    expect(parseDateTime('2026-10-15T03:30:00Z', 'Australia/Sydney')?.time).toEqual({
      hour: 14,
      minute: 30,
      second: 0,
    })
    expect(parseDateTime('2026-10-15T14:30:00+11:00', 'UTC')?.time).toEqual({
      hour: 3,
      minute: 30,
      second: 0,
    })
    expect(parseDateTime('2026-10-15')).toBeNull()
    expect(parseDateTime('2026-02-30T10:00')).toBeNull()
  })

  it('writes a wall clock, or the UTC instant when there is a zone', () => {
    const parts = {
      date: { year: 2026, month: 10, day: 15 },
      time: { hour: 14, minute: 30, second: 5 },
    }
    expect(formatDateTime(parts)).toBe('2026-10-15T14:30')
    expect(formatDateTime(parts, 'second')).toBe('2026-10-15T14:30:05')
    expect(formatDateTime(parts, 'second', 'Australia/Sydney')).toBe('2026-10-15T03:30:05Z')
    expect(formatDateTime(parts, 'minute', 'UTC')).toBe('2026-10-15T14:30:05Z')
  })

  it("finds today in a zone, not the runtime's", () => {
    const now = Date.UTC(2026, 9, 15, 20, 0)
    expect(todayIn('UTC', now)).toEqual({ year: 2026, month: 10, day: 15 })
    expect(todayIn('Australia/Sydney', now)).toEqual({ year: 2026, month: 10, day: 16 })
  })

  it('reads the date order and separators from the locale', () => {
    expect(datePattern('en-AU')).toEqual([
      { type: 'day' },
      { type: 'literal', value: '/' },
      { type: 'month' },
      { type: 'literal', value: '/' },
      { type: 'year' },
    ])
    expect(datePattern('en-US').filter((part) => part.type !== 'literal')).toEqual([
      { type: 'month' },
      { type: 'day' },
      { type: 'year' },
    ])
    expect(datePattern('ja-JP').map((part) => part.type)[0]).toBe('year')
  })

  it('reads the week start and clock from the locale', () => {
    expect(defaultFirstDayOfWeek('en-AU')).toBe(1)
    expect(defaultFirstDayOfWeek('en-US')).toBe(0)
    expect(defaultHourCycle('en-US')).toBe(12)
    expect(defaultHourCycle('en-GB')).toBe(24)
  })

  it('names months, weekdays, days and day periods', () => {
    expect(formatMonthYear('en-AU', 2026, 10)).toBe('October 2026')
    expect(formatFullDate('en-AU', { year: 2026, month: 10, day: 15 })).toBe(
      'Thursday 15 October 2026',
    )
    const names = weekdayNames('en-AU', 1)
    expect(names[0]).toEqual({ short: 'Mon', long: 'Monday' })
    expect(names[6]?.long).toBe('Sunday')
    expect(weekdayNames('en-US', 0)[0]?.long).toBe('Sunday')
    expect(dayPeriodNames('en-US')).toEqual(['AM', 'PM'])
  })
})
