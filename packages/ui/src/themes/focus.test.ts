import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { contrast, declarations, resolveColour, type Mode, type Oklch } from '#test/oklch'
import { THEMES } from '../theme/themes'

/*
 * ADR 0052: a theme's focus ring may take its own hue instead of the ink, so check what
 * "focus is neutral" used to guarantee. The ring reaches 3:1 (WCAG 1.4.11) against every fill it
 * can sit beside, inset rings on accent-soft and highlighted rows included, and it can never be
 * read as validation: it stays ΔE_OK 0.1 from the critical and positive tones and their text,
 * and, when it has a hue at all, 60° of hue from them.
 */
// Monograph and Fiesta are being retired (ADR 0045) and keep their ink focus as they are:
// Fiesta's ink ring measures 1.4:1 on its dark gold highlight.
const LEGACY: readonly string[] = ['monograph', 'fiesta']
const MODES: readonly Mode[] = ['light', 'dark']
const GROUNDS = [
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
/** Distance from a validation colour, in OKLab, below which focus could pass for it. */
const MIN_DISTANCE = 0.1
const MIN_HUE_GAP = 60
/** Below this chroma a colour reads as a grey, so its hue says nothing. */
const HUED = 0.04

const lab = ({ l, c, h }: Oklch) => {
  const radians = (h * Math.PI) / 180
  return [l, c * Math.cos(radians), c * Math.sin(radians)] as const
}
const distance = (one: Oklch, two: Oklch) => {
  const [a, b] = [lab(one), lab(two)]
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}
const hueGap = (one: number, two: number) => {
  const gap = Math.abs(one - two) % 360
  return Math.min(gap, 360 - gap)
}

const cases = THEMES.filter((theme) => !LEGACY.includes(theme)).flatMap((theme) =>
  MODES.map((mode) => [theme, mode] as const),
)

describe.each(cases)('%s, %s mode: focus', (theme, mode) => {
  const tokens = declarations(readFileSync(resolve(__dirname, `./${theme}.css`), 'utf8'))
  const colour = (name: string) => resolveColour(tokens, name, mode)
  const focus = colour('--color-focus')

  it('the ring reaches 3:1 against every fill it sits beside', () => {
    const offenders = GROUNDS.map((ground) => ({
      ground,
      ratio: contrast(focus, colour(ground)),
    })).filter(({ ratio }) => ratio < GRAPHIC)
    expect(offenders).toEqual([])
  })

  it('the ring never looks like validation', () => {
    const offenders = VALIDATION.map((tone) => {
      const other = colour(tone)
      return {
        tone,
        distance: distance(focus, other),
        hueGap: focus.c >= HUED && other.c >= HUED ? hueGap(focus.h, other.h) : 180,
      }
    }).filter((pair) => pair.distance < MIN_DISTANCE || pair.hueGap < MIN_HUE_GAP)
    expect(offenders).toEqual([])
  })
})
