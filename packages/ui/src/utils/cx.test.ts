import { describe, it, expect } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('joins multiple class names', () => {
    expect(cx('foo', 'bar')).toBe('foo bar')
  })

  it('filters out falsy values', () => {
    expect(cx('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })

  it('returns empty string when all values are falsy', () => {
    expect(cx(false, undefined, null)).toBe('')
  })

  it('handles a single class name', () => {
    expect(cx('foo')).toBe('foo')
  })

  it('handles conditional classes', () => {
    const classes = (isActive: boolean, isDisabled: boolean) =>
      cx('base', isActive && 'active', isDisabled && 'disabled')
    expect(classes(true, false)).toBe('base active')
  })
})
