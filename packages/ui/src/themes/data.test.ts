import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { contrast, declarations, resolveColour, type Mode } from '#test/oklch'
import { THEMES } from '../theme/themes'

/*
 * DESIGN.md §3.2's data tokens, checked as colour rather than as names: the ramps step in
 * perceived lightness (OKLCH L), the diverging midpoint is neutral, and the chart chrome and
 * categorical strokes reach WCAG contrast on the grounds a chart sits on. Values are read from
 * each built-in theme's stylesheet in both modes.
 */
const MODES: readonly Mode[] = ['light', 'dark']
const SEQ = Array.from({ length: 7 }, (_, i) => `--color-seq-${String(i + 1)}`)
const NEG = ['--color-div-neg-1', '--color-div-neg-2', '--color-div-neg-3']
const POS = ['--color-div-pos-1', '--color-div-pos-2', '--color-div-pos-3']
const STROKES = Array.from({ length: 8 }, (_, i) => `--color-cat-${String(i + 1)}-stroke`)

/** Smallest lightness step between neighbouring ramp colours, so steps stay tellable apart. */
const MIN_STEP = 0.05
/** Most chroma a midpoint may carry and still read as neutral (a tinted grey, per §2). */
const NEUTRAL_CHROMA = 0.025
const TEXT = 4.5
const GRAPHIC = 3

const cases = THEMES.flatMap((theme) => MODES.map((mode) => [theme, mode] as const))
const tokensOf = (theme: string) =>
  declarations(readFileSync(resolve(__dirname, `./${theme}.css`), 'utf8'))

describe.each(cases)('%s, %s mode: data tokens', (theme, mode) => {
  const tokens = tokensOf(theme)
  const colour = (name: string) => resolveColour(tokens, name, mode)
  // More data moves away from the page: darker on a light page, lighter on a dark one.
  const away = mode === 'light' ? -1 : 1
  const grounds = ['--color-canvas', '--color-surface']

  it('the sequential ramp steps away from the page in lightness', () => {
    const steps = SEQ.map((name) => colour(name).l)
    const offenders = steps
      .slice(1)
      .map((l, i) => ({ from: SEQ[i], to: SEQ[i + 1], step: (l - (steps[i] ?? 0)) * away }))
      .filter(({ step }) => step < MIN_STEP)
    expect(offenders).toEqual([])
  })

  it('the diverging midpoint is neutral and each arm steps away from it', () => {
    const mid = colour('--color-div-mid')
    expect(mid.c, '--color-div-mid chroma').toBeLessThanOrEqual(NEUTRAL_CHROMA)
    const offenders = [NEG, POS].flatMap((arm) => {
      const steps = [mid.l, ...arm.map((name) => colour(name).l)]
      return steps
        .slice(1)
        .map((l, i) => ({ to: arm[i], step: (l - (steps[i] ?? 0)) * away }))
        .filter(({ step }) => step < MIN_STEP)
    })
    expect(offenders).toEqual([])
  })

  it('the diverging arms are two hues at matching lightness', () => {
    const lightnessGaps = NEG.map((name, i) =>
      Math.abs(colour(name).l - colour(POS[i] ?? '').l),
    ).filter((gap) => gap > 0.04)
    expect(lightnessGaps).toEqual([])
    const hueGap = Math.abs(colour('--color-div-neg-3').h - colour('--color-div-pos-3').h) % 360
    expect(Math.min(hueGap, 360 - hueGap)).toBeGreaterThanOrEqual(90)
  })

  it('chart text reaches AA on the page and the tooltip', () => {
    const pairs = [
      ...[...grounds, '--chart-tooltip-surface'].map((ground) => ['--chart-label', ground]),
      ['--chart-tooltip-ink', '--chart-tooltip-surface'],
    ]
    const offenders = pairs
      .map(([ink = '', ground = '']) => ({
        ink,
        ground,
        ratio: contrast(colour(ink), colour(ground)),
      }))
      .filter(({ ratio }) => ratio < TEXT)
    expect(offenders).toEqual([])
  })

  it('axes, focus and series strokes reach 3:1 as graphics', () => {
    const pairs = [
      ...grounds.map((ground) => ['--chart-axis', ground]),
      ...[...grounds, '--chart-tooltip-surface'].map((ground) => ['--chart-focus', ground]),
      ...STROKES.flatMap((stroke) => grounds.map((ground) => [stroke, ground])),
    ]
    const offenders = pairs
      .map(([ink = '', ground = '']) => ({
        ink,
        ground,
        ratio: contrast(colour(ink), colour(ground)),
      }))
      .filter(({ ratio }) => ratio < GRAPHIC)
    expect(offenders).toEqual([])
  })

  it('the grid is visible but quieter than the axis', () => {
    const offenders = grounds
      .map((ground) => ({
        ground,
        grid: contrast(colour('--chart-grid'), colour(ground)),
        axis: contrast(colour('--chart-axis'), colour(ground)),
      }))
      .filter(({ grid, axis }) => grid < 1.15 || grid >= axis)
    expect(offenders).toEqual([])
  })
})
