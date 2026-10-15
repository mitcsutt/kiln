import { toDate, valueFormatter, xFormatter } from '#core/format'

describe('valueFormatter', () => {
  it('writes presets through Intl in the given locale', () => {
    expect(valueFormatter('number', { locale: 'en-AU' })(12480.456)).toBe('12,480.46')
    expect(valueFormatter('integer', { locale: 'en-AU' })(12480.6)).toBe('12,481')
    expect(valueFormatter('compact', { locale: 'en-AU' })(12480)).toBe('12.5K')
    expect(valueFormatter('percent', { locale: 'en-AU' })(0.125)).toBe('12.5%')
    expect(valueFormatter('number', { locale: 'de-DE' })(12480.5)).toBe('12.480,5')
  })

  it('takes Intl options and functions', () => {
    expect(valueFormatter({ style: 'currency', currency: 'EUR' }, { locale: 'en-IE' })(1200)).toBe(
      '€1,200.00',
    )
    expect(valueFormatter((value) => `${String(value)} kWh`)(42)).toBe('42 kWh')
  })

  it('writes a missing value as a dash', () => {
    expect(valueFormatter()(null)).toBe('–')
    expect(valueFormatter()(Number.NaN)).toBe('–')
  })
})

describe('xFormatter', () => {
  it('writes dates in a preset, and calendar days the same in every time zone', () => {
    const format = xFormatter('month', { locale: 'en-GB' })
    expect(format('2026-03-01')).toBe('Mar 2026')
    expect(xFormatter('date', { locale: 'en-GB' })('2026-03-01')).toBe('1 Mar')
  })

  it('writes calendar days in UTC whatever time zone is given', () => {
    const options = { locale: 'en-GB', timeZone: 'America/New_York' }
    expect(xFormatter('date', options)('2026-03-01')).toBe('1 Mar')
    expect(xFormatter('month', options)('2026-03')).toBe('Mar 2026')
  })

  it('writes a datetime with no offset as written, whatever time zone is given', () => {
    const plain = xFormatter('datetime', { locale: 'en-GB' })('2026-03-01T14:30')
    expect(plain).toBe('1 Mar, 14:30')
    for (const timeZone of ['UTC', 'Europe/London', 'America/New_York', 'Australia/Sydney']) {
      expect(xFormatter('datetime', { locale: 'en-GB', timeZone })('2026-03-01T14:30')).toBe(plain)
    }
    expect(
      xFormatter('time', { locale: 'en-GB', timeZone: 'Australia/Sydney' })('2026-03-01 09:05'),
    ).toBe('9:05')
  })

  it('reads a datetime with no offset as the same instant in every runtime zone', () => {
    const zone = process.env.TZ
    try {
      const instants = ['UTC', 'America/New_York', 'Australia/Sydney'].map((tz) => {
        process.env.TZ = tz
        return toDate('2026-03-01T14:30')?.toISOString()
      })
      expect(instants).toEqual(Array(3).fill('2026-03-01T14:30:00.000Z'))
    } finally {
      if (zone === undefined) delete process.env.TZ
      else process.env.TZ = zone
    }
  })

  it('gives a custom formatter the wall clock as written in every runtime zone', () => {
    const zone = process.env.TZ
    const clock = (date: Date) =>
      `${String(date.getHours())}:${String(date.getMinutes()).padStart(2, '0')}`
    try {
      const written = ['UTC', 'America/New_York', 'Australia/Sydney'].map((tz) => {
        process.env.TZ = tz
        return [
          xFormatter(clock)('2026-03-01T14:30'),
          xFormatter((d) => String(d.getDate()))('2026-03-01'),
        ]
      })
      expect(written).toEqual(Array(3).fill(['14:30', '1']))
      process.env.TZ = 'Australia/Sydney'
      expect(xFormatter(clock)('2026-03-01T03:30Z')).toBe('14:30')
    } finally {
      if (zone === undefined) delete process.env.TZ
      else process.env.TZ = zone
    }
  })

  it('writes a datetime with an offset in the given time zone', () => {
    const format = xFormatter('time', { locale: 'en-GB', timeZone: 'Australia/Sydney' })
    expect(format('2026-03-01T03:30Z')).toBe('14:30')
    expect(format('2026-03-01T14:30+11:00')).toBe('14:30')
  })

  it('uses the given time zone for instants', () => {
    const format = xFormatter('time', { locale: 'en-GB', timeZone: 'UTC' })
    expect(format(new Date(Date.UTC(2026, 2, 1, 14, 30)))).toBe('14:30')
  })

  it('writes anything else as text', () => {
    expect(xFormatter(undefined)('Harbour')).toBe('Harbour')
    expect(xFormatter(undefined)(2026)).toBe('2026')
  })

  it('reads dates and ISO strings, and nothing else', () => {
    expect(toDate('2026-03-01')?.toISOString()).toBe('2026-03-01T00:00:00.000Z')
    expect(toDate('March')).toBeUndefined()
    expect(toDate(new Date(Number.NaN))).toBeUndefined()
  })
})
