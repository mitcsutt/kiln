import { visibilityClass } from './visibility'

describe('visibilityClass', () => {
  it('returns undefined when nothing is hidden', () => {
    expect(visibilityClass({})).toBeUndefined()
  })
  it('combines below and above classes', () => {
    const c = visibilityClass({ hideBelow: 'md', hideAbove: 'xl' })
    expect(c?.split(' ')).toHaveLength(2)
  })
})
