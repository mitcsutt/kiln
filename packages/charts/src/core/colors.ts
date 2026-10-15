import type { CategoryColor } from '@mitcsutt/kiln-ui'

/** A step of the sequential ramp, `--color-seq-1` (least) to `--color-seq-7` (most). */
export type SequentialStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** A step of the diverging ramp around its neutral midpoint `--color-div-mid`. */
export type DivergingStep = 'neg-3' | 'neg-2' | 'neg-1' | 'mid' | 'pos-1' | 'pos-2' | 'pos-3'

/** The status tones a mark can take: the same `--tone-*` colours as the rest of kiln-ui. */
export type ChartTone = 'positive' | 'caution' | 'critical' | 'info'

/**
 * A theme colour for a series or mark. Lead with these, so the chart restyles with the theme:
 *
 * - `cat-1` to `cat-8`: categorical colours, for who or what a series is. A series takes the
 *   next free one by default.
 * - `seq-1` to `seq-7` and `div-neg-3` to `div-pos-3`: the ramps, for how much.
 * - `accent`, `positive`, `caution`, `critical`, `info`: the accent and the status tones.
 * - `neutral`: quiet ink, for "Other", a baseline or a reference.
 *
 * Any CSS colour also works, for data that carries its own colours.
 */
export type ChartColorToken =
  | `cat-${CategoryColor}`
  | `seq-${SequentialStep}`
  | `div-${DivergingStep}`
  | 'accent'
  | ChartTone
  | 'neutral'

/** A theme colour token, or any CSS colour (`#0b6e4f`, `oklch(…)`, `var(--brand)`). */

export type ChartColor = ChartColorToken | (string & {})

/** A colour as the marks use it: a fill for bars, areas and swatches, and a stroke for lines and outlines. */
export interface ResolvedColor {
  fill: string
  stroke: string
}

const TONES = new Set<string>(['positive', 'caution', 'critical', 'info'])

/**
 * Turns a chart colour into CSS values. Every token resolves to a `var()`, so a mounted chart
 * restyles with the theme and mode through CSS alone, with no React render.
 */
export function resolveColor(color: ChartColor): ResolvedColor {
  if (/^cat-[1-8]$/.test(color)) {
    return { fill: `var(--color-${color})`, stroke: `var(--color-${color}-stroke)` }
  }
  if (/^seq-[1-7]$/.test(color) || /^div-(neg-[1-3]|mid|pos-[1-3])$/.test(color)) {
    const value = `var(--color-${color})`
    return { fill: value, stroke: value }
  }
  if (color === 'accent') return { fill: 'var(--color-accent)', stroke: 'var(--color-accent)' }
  if (TONES.has(color)) return { fill: `var(--tone-${color})`, stroke: `var(--tone-${color}-text)` }
  if (color === 'neutral') return { fill: 'var(--color-line-strong)', stroke: 'var(--chart-axis)' }
  return { fill: color, stroke: color }
}

/** The categorical slot a colour names, if it names one. */
function categorySlot(color: ChartColor | undefined): number | undefined {
  const match = color === undefined ? null : /^cat-([1-8])$/.exec(color)
  return match ? Number(match[1]) : undefined
}

const SLOTS = 8

/**
 * Hands out categorical colours to series keys in first-seen order, so the same key keeps the
 * same colour. Pinned colours win, and an automatic colour skips the categorical slots that
 * pins already hold. Past eight keys the slots repeat.
 */
export class ColorAssigner {
  readonly #pins = new Map<string, ChartColor>()
  readonly #assigned = new Map<string, number>()
  readonly #reserved = new Set<number>()
  #next = 0

  constructor(pins: Readonly<Record<string, ChartColor>> = {}, order: readonly string[] = []) {
    for (const [key, color] of Object.entries(pins)) this.pin(key, color)
    for (const key of order) this.colorOf(key)
  }

  /** Fixes `key` to `color` from now on. */
  pin(key: string, color: ChartColor): void {
    this.#pins.set(key, color)
    const slot = categorySlot(color)
    if (slot !== undefined) this.#reserved.add(slot)
  }

  /** Whether `color` names a categorical slot a pin holds. */
  isReserved(color: ChartColor): boolean {
    const slot = categorySlot(color)
    return slot !== undefined && this.#reserved.has(slot)
  }

  /** The colour for `key`: its pin, its earlier colour, or the next free categorical slot. */
  colorOf(key: string): ChartColor {
    const pinned = this.#pins.get(key)
    if (pinned !== undefined) return pinned
    let slot = this.#assigned.get(key)
    if (slot === undefined) {
      slot = this.#take()
      this.#assigned.set(key, slot)
    }
    return `cat-${String(slot)}`
  }

  #take(): number {
    for (let tries = 0; tries < SLOTS; tries++) {
      const slot = (this.#next % SLOTS) + 1
      this.#next++
      if (!this.#reserved.has(slot)) return slot
    }
    const slot = (this.#next % SLOTS) + 1
    this.#next++
    return slot
  }
}
