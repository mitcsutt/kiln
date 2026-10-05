import { describe, expect, it } from 'vitest'
import { shallowEqual } from '#utils/shallow'

describe('shallowEqual', () => {
  it('compares primitives with Object.is', () => {
    expect(shallowEqual(1, 1)).toBe(true)
    expect(shallowEqual(Number.NaN, Number.NaN)).toBe(true)
    expect(shallowEqual('a', 'b')).toBe(false)
  })

  it('compares arrays and objects one level deep', () => {
    expect(shallowEqual(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(shallowEqual(['a'], ['a', 'b'])).toBe(false)
    expect(shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true)
    expect(shallowEqual({ a: { n: 1 } }, { a: { n: 1 } })).toBe(false)
    expect(shallowEqual({ a: 1 }, { b: 1 } as unknown as { a: number })).toBe(false)
  })

  it('compares Maps and Sets by entries', () => {
    expect(shallowEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true)
    expect(shallowEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true)
    expect(shallowEqual(new Set([1]), new Set([2]))).toBe(false)
  })
})
