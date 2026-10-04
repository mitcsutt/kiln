import { describe, expect, it } from 'vitest'
import { EMPTY_OPTION_VALUE, createOptionMapping } from '#core/binding/optionValues'

describe('createOptionMapping', () => {
  it('round-trips numbers and booleans losslessly', () => {
    const numbers = createOptionMapping([
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ])
    expect(numbers.toUi(2)).toBe('2')
    expect(numbers.fromUi('2')).toBe(2)
    const booleans = createOptionMapping([
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ])
    expect(booleans.fromUi('false')).toBe(false)
    expect(booleans.toUi(false)).toBe('false')
  })

  it("maps null and unknown values to '' (placeholder) and back to null", () => {
    const mapping = createOptionMapping([{ value: 'gbp', label: 'Pound sterling' }])
    expect(mapping.toUi(null)).toBe('')
    expect(mapping.toUi(undefined)).toBe('')
    expect(mapping.fromUi('')).toBeNull()
    expect(mapping.fromUi('eur')).toBeNull()
  })

  it('adds an emptyOption row that maps to null', () => {
    const mapping = createOptionMapping([{ value: 3, label: 'Three' }], { emptyOption: 'Any' })
    expect(mapping.uiOptions[0]).toEqual({ value: EMPTY_OPTION_VALUE, label: 'Any' })
    expect(mapping.fromUi(EMPTY_OPTION_VALUE)).toBeNull()
  })

  it('keeps group, description and disabled; labels values for view mode', () => {
    const mapping = createOptionMapping([
      {
        value: 'lis',
        label: 'Lisbon',
        group: 'Europe',
        disabled: true,
        description: 'Fully booked',
      },
    ])
    expect(mapping.uiOptions).toEqual([
      {
        value: 'lis',
        label: 'Lisbon',
        group: 'Europe',
        disabled: true,
        description: 'Fully booked',
      },
    ])
    expect(mapping.labelOf('lis')).toBe('Lisbon')
    expect(mapping.labelOf(null)).toBeUndefined()
  })
})
