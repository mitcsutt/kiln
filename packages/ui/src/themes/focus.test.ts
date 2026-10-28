import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { contrast, declarations, resolveColour, type Mode, type Oklch } from '#test/oklch'
import { THEMES as REGISTERED } from '../theme/themes'

/*
 * DESIGN.md §2's focus rule (ADR 0052), checked as colour: the ring clears WCAG 1.4.11's 3:1
 * on every fill it can sit beside, and stays clear of the validation tones so focus never
 * reads as an error or a success. Values are read from each built-in theme's stylesheet in
 * both modes.
 */
// Deprecated and kept exactly as before (ADR 0045); they predate this rule.
const LEGACY: readonly string[] = ['monograph', 'fiesta']
const THEMES = REGISTERED.filter((theme) => !LEGACY.includes(theme))
const MODES: readonly Mode[] = ['light', 'dark']

/** The page, the sheets, popovers, and the fills an inset ring draws on (nav rows, tabs). */
const ADJACENT = [
  '--color-canvas',
  '--color-surface',
  '--color-surface-sunken',
  '--color-surface-raised',
  '--color-accent-soft',
  '--color-highlight',
]
const VALIDATION = [
  '--tone-critical',
  '--tone-critical-text',
  '--tone-positive',
  '--tone-positive-text',
]
const GRAPHIC = 3
/** Least hue distance from a validation tone, for a focus colour with a hue of its own. */
const MIN_HUE_GAP = 60
/** Least OKLab distance from a validation tone. */
const MIN_DELTA_E = 0.1
/** Below this chroma a colour reads as neutral (ink), and its hue says nothing. */
const HUED = 0.04

const cases = THEMES.flatMap((theme) => MODES.map((mode) => [theme, mode] as const))
const tokensOf = (theme: string) =>
  declarations(readFileSync(resolve(__dirname, `./${theme}.css`), 'utf8'))

const hueGap = (one: Oklch, two: Oklch) => {
  const gap = Math.abs(one.h - two.h) % 360
  return Math.min(gap, 360 - gap)
}
const deltaE = (one: Oklch, two: Oklch) => {
  const ab = ({ c, h }: Oklch) => [
    c * Math.cos((h * Math.PI) / 180),
    c * Math.sin((h * Math.PI) / 180),
  ]
  const [a1 = 0, b1 = 0] = ab(one)
  const [a2 = 0, b2 = 0] = ab(two)
  return Math.hypot(one.l - two.l, a1 - a2, b1 - b2)
}

describe.each(cases)('%s, %s mode: focus', (theme, mode) => {
  const tokens = tokensOf(theme)
  const colour = (name: string) => resolveColour(tokens, name, mode)
  const focus = colour('--color-focus')

  it('the ring reaches 3:1 on every fill it sits beside', () => {
    const offenders = ADJACENT.map((ground) => ({
      ground,
      ratio: contrast(focus, colour(ground)),
    })).filter(({ ratio }) => ratio < GRAPHIC)
    expect(offenders).toEqual([])
  })

  it('the ring never looks like validation', () => {
    const offenders = VALIDATION.map((tone) => ({
      tone,
      hue: focus.c >= HUED && colour(tone).c >= HUED ? hueGap(focus, colour(tone)) : 360,
      deltaE: deltaE(focus, colour(tone)),
    })).filter(({ hue, deltaE }) => hue < MIN_HUE_GAP || deltaE < MIN_DELTA_E)
    expect(offenders).toEqual([])
  })
})
