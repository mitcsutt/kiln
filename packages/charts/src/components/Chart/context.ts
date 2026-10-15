import { createContext, useContext, type ReactElement } from 'react'

import type { SwatchShape } from '#components/internal/Swatch/Swatch'
import type { ChartColor } from '#core/colors'
import type { ChartRow } from '#core/data'
import type { FormatLocale } from '#core/format'

/** Which way a Cartesian chart runs. */
export type ChartLayout = 'horizontal' | 'vertical'

/** The series kinds a chart can mix. */
export type SeriesKind = 'bar' | 'line' | 'area'

/** A series as the chart knows it once its parts are read. */
export interface SeriesInfo {
  key: string
  label: string
  kind: SeriesKind
  color: ChartColor
  shape: SwatchShape
  format: (value: unknown) => string
}

/** What a chart's parts read from the chart they're in. */
export interface ChartContextValue {
  /** The key of the x value in each row. */
  x: string
  layout: ChartLayout
  rows: readonly ChartRow[]
  series: ReadonlyMap<string, SeriesInfo>
  hidden: ReadonlySet<string>
  formatX: (value: unknown) => string
  formatValue: (value: unknown) => string
  /** The chart's `locale` and `timeZone`, for a part that formats on its own terms. */
  formatLocale: FormatLocale
  /** Whether marks animate: the chart's `animate`, and never under reduced motion. */
  animate: boolean
}

export const ChartContext = createContext<ChartContextValue | null>(null)

export function useChart(part: string): ChartContextValue {
  const chart = useContext(ChartContext)
  if (!chart) throw new Error(`${part} must be inside a <Chart>.`)
  return chart
}

/** How long marks take to grow in or move to new data: the theme scale's slowest step. */
export const ANIMATION_MS = 340

/**
 * Marks a component as a chart part the root reads before drawing: a series (so the legend, the
 * tooltip and the data table know it), the legend, or zoom.
 */
export type PartKind = SeriesKind | 'legend' | 'zoom'

export interface PartMarker {
  kilnChartPart?: PartKind
}

/** The part kind of a child element, if it's a chart part. */
export function partOf(element: ReactElement): PartKind | undefined {
  const type = element.type as PartMarker | string
  return typeof type === 'string' ? undefined : type.kilnChartPart
}
