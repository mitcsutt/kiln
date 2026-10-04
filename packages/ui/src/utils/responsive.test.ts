import { responsiveVars, baseValue, mergeStyles } from './responsive'

describe('responsiveVars', () => {
  it('returns {} for undefined', () => {
    expect(responsiveVars('g', undefined, String)).toEqual({})
  })
  it('spreads a scalar across every breakpoint', () => {
    expect(responsiveVars('g', 2, (v) => `s${String(v)}`)).toEqual({
      '--g-base': 's2',
      '--g-sm': 's2',
      '--g-md': 's2',
      '--g-lg': 's2',
      '--g-xl': 's2',
    })
  })
  it('cascades defined values upward', () => {
    expect(responsiveVars('g', { base: 1, md: 4 }, String)).toEqual({
      '--g-base': '1',
      '--g-sm': '1',
      '--g-md': '4',
      '--g-lg': '4',
      '--g-xl': '4',
    })
  })
  it('leaves breakpoints below the first defined value unset', () => {
    expect(responsiveVars('g', { lg: 3 }, String)).toEqual({ '--g-lg': '3', '--g-xl': '3' })
  })
})

describe('baseValue', () => {
  it('handles scalars, maps and undefined', () => {
    expect(baseValue(3)).toBe(3)
    expect(baseValue({ md: 'a', lg: 'b' })).toBe('a')
    expect(baseValue<number>(undefined)).toBeUndefined()
  })
})

describe('mergeStyles', () => {
  it('drops empty/undefined entries', () => {
    expect(mergeStyles(undefined, {})).toBeUndefined()
    expect(mergeStyles({ color: 'red' }, undefined, { margin: 0 })).toEqual({
      color: 'red',
      margin: 0,
    })
  })
})
