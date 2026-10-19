import { ColorAssigner, resolveColor } from '#core/colors'

describe('resolveColor', () => {
  it('turns tokens into theme variables, so the theme restyles them', () => {
    expect(resolveColor('cat-3')).toEqual({
      fill: 'var(--color-cat-3)',
      stroke: 'var(--color-cat-3-stroke)',
    })
    expect(resolveColor('seq-5')).toEqual({
      fill: 'var(--color-seq-5)',
      stroke: 'var(--color-seq-5)',
    })
    expect(resolveColor('div-neg-2').fill).toBe('var(--color-div-neg-2)')
    expect(resolveColor('div-mid').fill).toBe('var(--color-div-mid)')
    expect(resolveColor('positive')).toEqual({
      fill: 'var(--tone-positive)',
      stroke: 'var(--tone-positive-text)',
    })
    expect(resolveColor('accent').stroke).toBe('var(--color-accent)')
    expect(resolveColor('neutral').stroke).toBe('var(--chart-axis)')
  })

  it('passes any other CSS colour through', () => {
    expect(resolveColor('#0b6e4f')).toEqual({ fill: '#0b6e4f', stroke: '#0b6e4f' })
    expect(resolveColor('cat-9')).toEqual({ fill: 'cat-9', stroke: 'cat-9' })
  })
})

describe('ColorAssigner', () => {
  it('gives keys categorical colours in first-seen order and keeps them', () => {
    const colors = new ColorAssigner()
    expect(colors.colorOf('Harbour')).toBe('cat-1')
    expect(colors.colorOf('Quay')).toBe('cat-2')
    expect(colors.colorOf('Harbour')).toBe('cat-1')
  })

  it('lets pins win and skips the categorical slots they hold', () => {
    const colors = new ColorAssigner({ Quay: 'cat-1', Docklands: 'positive' })
    expect(colors.colorOf('Quay')).toBe('cat-1')
    expect(colors.colorOf('Docklands')).toBe('positive')
    expect(colors.colorOf('Harbour')).toBe('cat-2')
  })

  it('colours a given order first', () => {
    const colors = new ColorAssigner({}, ['Riverside', 'Harbour'])
    expect(colors.colorOf('Harbour')).toBe('cat-2')
    expect(colors.colorOf('Riverside')).toBe('cat-1')
  })

  it('repeats the slots past eight keys', () => {
    const colors = new ColorAssigner()
    const assigned = Array.from({ length: 9 }, (_, i) => colors.colorOf(`k${String(i)}`))
    expect(assigned.at(-1)).toBe('cat-1')
  })
})
