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
