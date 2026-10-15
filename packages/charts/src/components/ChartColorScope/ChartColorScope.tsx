import { createContext, useContext, useState, type ReactNode } from 'react'

import { ColorAssigner, type ChartColor } from '#core/colors'

const ColorScopeContext = createContext<ColorAssigner | null>(null)

export interface ChartColorScopeProps {
  /**
   * Colours fixed for some keys, across every chart inside. An automatic colour skips the
   * categorical slots these hold.
   */
  colors?: Readonly<Record<string, ChartColor>>
  /**
   * Keys to colour first, in this order, so the colours don't depend on which chart renders
   * first. Keys not listed take the next free colour when a chart first shows them.
   */
  order?: readonly string[]
  children?: ReactNode
}

/**
 * Gives a series the same colour in every chart inside it.
 *
 * @remarks
 * Without a scope, each chart colours its own series in order: `cat-1`, `cat-2`, and so on.
 * Put a dashboard's charts in one `ChartColorScope` and a key keeps its colour everywhere, so
 * "Harbour Street" is the same colour in the revenue chart, the orders chart and their legends.
 * Keys take `--color-cat-1` to `--color-cat-8` in the order the charts first show them. Pin a
 * colour with `colors`, or on the series itself with `color`; pins win.
 *
 * The scope renders no element of its own.
 */
export function ChartColorScope({ colors, order, children }: ChartColorScopeProps) {
  // One assigner for the scope's lifetime: a key's colour never changes once given.
  const [assigner] = useState(() => new ColorAssigner(colors, order))
  return <ColorScopeContext.Provider value={assigner}>{children}</ColorScopeContext.Provider>
}

const CATEGORY = /^cat-[1-8]$/
const CATEGORIES: readonly ChartColor[] = Array.from(
  { length: 8 },
  (_, i) => `cat-${String(i + 1)}`,
)

/** A series key and the colour it asks for, if it pins one. */
export interface SeriesColorRequest {
  key: string
  color?: ChartColor | undefined
}

/**
 * The colour of each series: its pin, else the scope's colour for its key (or this chart's own,
 * outside a scope). `neutralKey` (the "Other" series a pivot adds) is neutral unless pinned.
 */
export function useSeriesColors(
  series: readonly SeriesColorRequest[],
  neutralKey?: string,
): Map<string, ChartColor> {
  const scope = useContext(ColorScopeContext)
  // Assignment is idempotent, so doing it during render is safe under StrictMode and on the
  // server, and the first-seen order is the render order. A series' own pin stays local to its
  // chart: in a scope, pin a colour everywhere with the scope's `colors`. An automatic key whose
  // scope colour a pin here holds takes another slot this chart doesn't use, in this chart only.
  const assigner = scope ?? new ColorAssigner()
  const colors = new Map<string, ChartColor>()
  const used = new Set<ChartColor>()
  for (const { key, color } of series) {
    if (color === undefined) continue
    if (!scope) assigner.pin(key, color)
    colors.set(key, color)
    used.add(color)
  }
  const clashing: string[] = []
  for (const { key, color } of series) {
    if (color !== undefined) continue
    const auto = key === neutralKey ? 'neutral' : assigner.colorOf(key)
    if (scope && CATEGORY.test(auto) && used.has(auto)) clashing.push(key)
    else used.add(auto)
    colors.set(key, auto)
  }
  for (const key of clashing) {
    const free = CATEGORIES.find((color) => !used.has(color))
    if (free === undefined) continue
    colors.set(key, free)
    used.add(free)
  }
  return colors
}
