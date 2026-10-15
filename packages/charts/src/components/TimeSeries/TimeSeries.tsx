import { forwardRef } from 'react'

import { Chart, type ChartProps, type ChartZoomRange } from '#components/Chart/Chart'
import type { ChartCurve } from '#components/Chart/parts'
import { presetSeries, type SeriesConfig } from '#core/series'

/** A series of a time series: its key, and optionally its name, colour, format and line style. */
export interface TimeSeriesSeries extends SeriesConfig {
  /** `dashed` for a target, a forecast or last year. Lines only. */
  variant?: 'solid' | 'dashed'
}

export interface TimeSeriesProps extends Omit<
  ChartProps,
  'children' | 'layout' | 'stacking' | 'onPointClick'
> {
  /**
   * The series to plot. Defaults to every numeric key in the rows (or every series `pivot` makes),
   * in order.
   */
  series?: readonly TimeSeriesSeries[]
  /**
   * `line` for values to compare, `area` for one or two totals, `stacked` for parts that add up
   * to a whole over time. @defaultValue 'line'
   */
  variant?: 'line' | 'area' | 'stacked'
  /** @defaultValue 'linear' */
  curve?: ChartCurve
  /** Show the legend. @defaultValue true when there's more than one series */
  legend?: boolean
  /** Let readers zoom into a range by dragging, or with Shift and the arrow keys. @defaultValue true */
  zoomable?: boolean
  /** The zoomed range, when you control it. `null` shows everything. */
  zoom?: ChartZoomRange | null
  /** Called with the range a reader zooms to, or `null` when they reset. */
  onZoom?: (range: ChartZoomRange | null) => void
  /** Called when a reader clicks a point, or activates it from the keyboard. */
  onPointClick?: ChartProps['onPointClick']
}

/**
 * Values over time: one line or area per series, on a shared time axis, with a tooltip, a legend
 * and drag-to-zoom.
 *
 * @remarks
 * `TimeSeries` is the chart for anything measured over time: revenue by month, sign-ups by day,
 * response times by hour. Pass rows with a date and a value per series (or long rows and `pivot`),
 * and it plots every numeric key unless you name the `series`.
 *
 * Readers can zoom into a range by dragging across the plot. From the keyboard, focus the chart,
 * hold Shift and press the arrow keys to select a range, and press Enter to zoom in. A
 * "Show all" button resets the zoom, and `onZoom` reports each range.
 *
 * Points sit evenly along the axis, one per row. For a gap in time, include a row whose values
 * are missing: lines break there rather than joining across it.
 *
 * `TimeSeries` is a short composition of {@link Chart | Chart} parts. When you need something it
 * doesn't do, copy its source and change it: that's what it's for.
 *
 * @example Composition
 * ```tsx
 * <Chart data={rows} x={x} label={label} height={height}>
 *   <Chart.Grid />
 *   <Chart.XAxis />
 *   <Chart.YAxis />
 *   {series.map((s) => <Chart.Line key={s.key} dataKey={s.key} label={s.label} color={s.color} />)}
 *   <Chart.Tooltip />
 *   <Chart.Legend />
 *   <Chart.Zoom value={zoom} onZoom={onZoom} />
 * </Chart>
 * ```
 */
export const TimeSeries = forwardRef<HTMLElement, TimeSeriesProps>(function TimeSeries(
  {
    data,
    x,
    pivot,
    series: given,
    variant = 'line',
    curve = 'linear',
    legend,
    zoomable = true,
    zoom,
    onZoom,
    xFormat = 'date',
    ...rest
  },
  ref,
) {
  const { rows, series } = presetSeries(data, x, pivot, given)
  const variantOf = (key: string) => given?.find((s) => s.key === key)?.variant
  const showLegend = legend ?? series.length > 1
  return (
    <Chart ref={ref} data={rows} x={x} xFormat={xFormat} {...rest}>
      <Chart.Grid />
      <Chart.XAxis />
      <Chart.YAxis />
      {series.map((s) =>
        variant === 'line' ? (
          <Chart.Line
            key={s.key}
            dataKey={s.key}
            label={s.label}
            color={s.color}
            format={s.format}
            curve={curve}
            variant={variantOf(s.key)}
          />
        ) : (
          <Chart.Area
            key={s.key}
            dataKey={s.key}
            label={s.label}
            color={s.color}
            format={s.format}
            curve={curve}
            stack={variant === 'stacked'}
          />
        ),
      )}
      <Chart.Tooltip />
      {showLegend ? <Chart.Legend /> : null}
      {zoomable ? <Chart.Zoom value={zoom} onZoom={onZoom} /> : null}
    </Chart>
  )
})
