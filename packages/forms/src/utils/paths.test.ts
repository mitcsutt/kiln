import { describe, expect, it } from 'vitest'
import { formatPath, isAtOrUnder, normalisePath } from '#utils/paths'

describe('paths', () => {
  it('formats issue paths like TanStack field names', () => {
    expect(formatPath(['guests', 0, 'name'])).toBe('guests[0].name')
    expect(formatPath([{ key: 'address' }, { key: 'city' }])).toBe('address.city')
    expect(formatPath(['matrix', 1, 2])).toBe('matrix[1][2]')
    expect(formatPath([])).toBe('')
  })

  it('normalises dotted numeric segments: a.0.b → a[0].b', () => {
    expect(normalisePath('a.0.b')).toBe('a[0].b')
    expect(normalisePath('guests[2].name')).toBe('guests[2].name')
    expect(normalisePath('rows.1')).toBe('rows[1]')
    expect(normalisePath('name')).toBe('name')
  })

  it('isAtOrUnder matches the path and its descendants only', () => {
    expect(isAtOrUnder('address.city', 'address')).toBe(true)
    expect(isAtOrUnder('guests[0].name', 'guests')).toBe(true)
    expect(isAtOrUnder('address', 'address')).toBe(true)
    expect(isAtOrUnder('addressLine', 'address')).toBe(false)
  })
})
