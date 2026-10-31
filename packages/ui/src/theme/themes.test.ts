import { DEFAULT_THEME, THEMES, THEME_META } from './themes'

describe('THEME_META', () => {
  const deprecated = THEMES.filter((name) => THEME_META[name].deprecated)
  const current = THEMES.filter((name) => !THEME_META[name].deprecated)

  it('deprecates exactly Monograph and Fiesta (ADR 0045)', () => {
    expect(deprecated).toEqual(['monograph', 'fiesta'])
  })

  it('never deprecates the default theme', () => {
    expect(THEME_META[DEFAULT_THEME].deprecated).toBeUndefined()
  })

  it('names a current theme to switch to in every deprecation', () => {
    for (const name of deprecated) {
      const note = THEME_META[name].deprecated ?? ''
      const named = current.filter((other) => note.includes(THEME_META[other].label))
      expect(named.length, `${name} names no current theme to switch to`).toBeGreaterThan(0)
    }
  })
})
