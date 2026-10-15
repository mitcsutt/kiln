import { Area, Bar, CartesianGrid, Line, ReferenceLine, XAxis, YAxis } from 'recharts'

import type { ChartColor } from '#core/colors'
import { resolveColor } from '#core/colors'
import { valueFormatter, xFormatter, type ValueFormat, type XFormat } from '#core/format'

import { ANIMATION_MS, useChart, type PartMarker } from './context'

/**
 * Props passed straight to the chart engine's own component, for what Kiln's props don't cover.
 * They are outside semver: they depend on the engine and its version, and a minor release of
 * this package may change the engine under them. Reach for them last.
 */
export type EngineProps = Readonly<Record<string, unknown>>

/** What every series part takes. */
export interface ChartSeriesProps {
  /** The key of this series' values in each row. */
  dataKey: string
  /**
   * The series' name in the legend, the tooltip and the data table. Defaults to `dataKey` as
   * written when the chart has `pivot`, or a readable form of it otherwise.
   */
  label?: string
  /** A theme colour or any CSS colour. Defaults to the next categorical colour. */
  color?: ChartColor
  /** How to write this series' values, when it differs from the chart's `format`. */
  format?: ValueFormat
  /** Props for the engine's own series component. Outside semver. */
  engineProps?: EngineProps
}

/** How a line or an area's edge runs between points. */
export type ChartCurve = 'linear' | 'smooth' | 'step'

/** A stroke weight: `thin` 1px, `regular` 2px, `bold` 3px. */
export type ChartWeight = 'thin' | 'regular' | 'bold'

const CURVES = { linear: 'linear', smooth: 'monotone', step: 'stepAfter' } as const
const WEIGHTS = { thin: 1, regular: 2, bold: 3 } as const
const stackId = (stack: string | boolean | undefined) =>
  stack === true ? 'stack' : stack === false ? undefined : stack

/* ─── Series ──────────────────────────────────────────────────────────────── */

export interface ChartBarProps extends ChartSeriesProps {
  /** Stack this bar on others with the same stack id (`true` is one shared stack). */
  stack?: string | boolean
}

/** A bar series: one bar per row, side by side with other bars or stacked on them. */
function ChartBar({ dataKey, stack, engineProps }: ChartBarProps) {
  const chart = useChart('Chart.Bar')
  const series = chart.series.get(dataKey)
  const { fill, stroke } = resolveColor(series?.color ?? 'neutral')
  return (
    <Bar
      dataKey={dataKey}
      name={series?.label ?? dataKey}
      stackId={stackId(stack)}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
      maxBarSize={56}
      hide={chart.hidden.has(dataKey)}
      isAnimationActive={chart.animate}
      animationDuration={ANIMATION_MS}
      animationEasing="ease-out"
      {...engineProps}
    />
  )
}
const Bar_ = Object.assign(ChartBar, { kilnChartPart: 'bar' } satisfies PartMarker)

export interface ChartLineProps extends ChartSeriesProps {
  /** @defaultValue 'linear' */
  curve?: ChartCurve
  /** `dashed` for a target, a forecast or last year. @defaultValue 'solid' */
  variant?: 'solid' | 'dashed'
  /** @defaultValue 'regular' */
  weight?: ChartWeight
  /** Mark every point with a dot, not only the active one. */
  dots?: boolean
}

/** A line series: one point per row, joined. Missing values leave a gap. */
function ChartLine({
  dataKey,
  curve = 'linear',
  variant = 'solid',
  weight = 'regular',
  dots = false,
  engineProps,
}: ChartLineProps) {
  const chart = useChart('Chart.Line')
  const series = chart.series.get(dataKey)
  const { stroke } = resolveColor(series?.color ?? 'neutral')
  return (
    <Line
      dataKey={dataKey}
      name={series?.label ?? dataKey}
      type={CURVES[curve]}
      stroke={stroke}
      strokeWidth={WEIGHTS[weight]}
      strokeDasharray={variant === 'dashed' ? '6 4' : undefined}
      dot={dots ? { r: 3, fill: stroke, stroke: 'none' } : false}
      activeDot={{ r: 4, fill: stroke, stroke: 'none' }}
      hide={chart.hidden.has(dataKey)}
      isAnimationActive={chart.animate}
      animationDuration={ANIMATION_MS}
      animationEasing="ease-out"
      {...engineProps}
    />
  )
}
const Line_ = Object.assign(ChartLine, { kilnChartPart: 'line' } satisfies PartMarker)

export interface ChartAreaProps extends ChartSeriesProps {
  /** Stack this area on others with the same stack id (`true` is one shared stack). */
  stack?: string | boolean
  /** @defaultValue 'linear' */
  curve?: ChartCurve
  /** The weight of the area's top edge. @defaultValue 'regular' */
  weight?: ChartWeight
}

/**
 * An area series: a line with the space below it filled. Stacked areas fill solid; areas that
 * overlap are translucent so the ones behind still show.
 */
function ChartArea({
  dataKey,
  stack,
  curve = 'linear',
  weight = 'regular',
  engineProps,
}: ChartAreaProps) {
  const chart = useChart('Chart.Area')
  const series = chart.series.get(dataKey)
  const { fill, stroke } = resolveColor(series?.color ?? 'neutral')
  const id = stackId(stack)
  return (
    <Area
      dataKey={dataKey}
      name={series?.label ?? dataKey}
      type={CURVES[curve]}
      stackId={id}
      fill={fill}
      fillOpacity={id === undefined ? 0.3 : 1}
      stroke={stroke}
      strokeWidth={WEIGHTS[weight]}
      activeDot={{ r: 4, fill: stroke, stroke: 'none' }}
      hide={chart.hidden.has(dataKey)}
      isAnimationActive={chart.animate}
      animationDuration={ANIMATION_MS}
      animationEasing="ease-out"
      {...engineProps}
    />
  )
}
const Area_ = Object.assign(ChartArea, { kilnChartPart: 'area' } satisfies PartMarker)

/* ─── Chrome ──────────────────────────────────────────────────────────────── */

export interface ChartGridProps {
  /** Lines across the value axis, the ones a reader follows to read a value. @defaultValue true */
  values?: boolean
  /** Lines at each category or point too. @defaultValue false */
  categories?: boolean
  /** @defaultValue 'solid' */
  variant?: 'solid' | 'dashed'
  /** Props for the engine's own grid component. Outside semver. */
  engineProps?: EngineProps
}

/** Grid lines behind the marks, in `--chart-grid`. */
function ChartGrid({
  values = true,
  categories = false,
  variant = 'solid',
  engineProps,
}: ChartGridProps) {
  const { layout } = useChart('Chart.Grid')
  const horizontal = layout === 'horizontal' ? values : categories
  const vertical = layout === 'horizontal' ? categories : values
  return (
    <CartesianGrid
      horizontal={horizontal}
      vertical={vertical}
      stroke="var(--chart-grid)"
      strokeDasharray={variant === 'dashed' ? '3 3' : undefined}
      {...engineProps}
    />
  )
}

interface AxisProps {
  /** A title for the axis, such as a unit. */
  label?: string
  /** Leave the axis out but keep its scale (a sparse chart, a small multiple). */
  hide?: boolean
  /** Props for the engine's own axis component. Outside semver. */
  engineProps?: EngineProps
}

export interface ChartXAxisProps extends AxisProps {
  /**
   * How to write the ticks: an x format on the category axis, a value format when the chart runs
   * vertically (`layout="vertical"`) and x is the value axis. Defaults to the chart's.
   */
  format?: XFormat | ValueFormat
}

export interface ChartYAxisProps extends AxisProps {
  /**
   * How to write the ticks: a value format, or an x format when the chart runs vertically and y
   * is the category axis. Defaults to the chart's.
   */
  format?: ValueFormat | XFormat
}

/** The category axis's ticks: one per row, thinned to fit. */
function categoryAxis(
  chart: ReturnType<typeof useChart>,
  format: XFormat | ValueFormat | undefined,
) {
  const formatter =
    format === undefined ? chart.formatX : xFormatter(format as XFormat, chart.formatLocale)
  return {
    dataKey: chart.x,
    type: 'category' as const,
    tickFormatter: (value: unknown) => formatter(value),
    interval: 'preserveStartEnd' as const,
    minTickGap: 12,
    tickLine: false,
    axisLine: { stroke: 'var(--chart-axis)' },
  }
}

function valueAxis(chart: ReturnType<typeof useChart>, format: XFormat | ValueFormat | undefined) {
  const formatter =
    format === undefined
      ? chart.formatValue
      : valueFormatter(format as ValueFormat, chart.formatLocale)
  return {
    type: 'number' as const,
    tickFormatter: (value: unknown) => formatter(value),
    tickLine: false,
    axisLine: false,
    allowDecimals: true,
  }
}

/** The horizontal axis: x by default, or the values when the chart runs vertically. */
function ChartXAxis({ label, hide = false, format, engineProps }: ChartXAxisProps) {
  const chart = useChart('Chart.XAxis')
  const axis =
    chart.layout === 'horizontal' ? categoryAxis(chart, format) : valueAxis(chart, format)
  return (
    <XAxis
      {...axis}
      hide={hide}
      tickMargin={8}
      label={
        label
          ? { value: label, position: 'insideBottom', offset: -4, className: 'kiln-axis-label' }
          : undefined
      }
      {...engineProps}
    />
  )
}

/** The vertical axis: the values by default, or x when the chart runs vertically. */
function ChartYAxis({ label, hide = false, format, engineProps }: ChartYAxisProps) {
  const chart = useChart('Chart.YAxis')
  const axis =
    chart.layout === 'horizontal' ? valueAxis(chart, format) : categoryAxis(chart, format)
  return (
    <YAxis
      {...axis}
      hide={hide}
      width="auto"
      tickMargin={8}
      label={
        label
          ? { value: label, angle: -90, position: 'insideLeft', className: 'kiln-axis-label' }
          : undefined
      }
      {...engineProps}
    />
  )
}

export interface ChartReferenceLineProps {
  /** A value to mark across the plot: a target, a limit, an average. */
  value?: number
  /** An x value to mark instead: the day a release went out. */
  x?: string | number
  /** Text beside the line. */
  label?: string
  /** @defaultValue 'neutral' */
  color?: ChartColor
  /** @defaultValue 'dashed' */
  variant?: 'solid' | 'dashed'
  /** Props for the engine's own reference line component. Outside semver. */
  engineProps?: EngineProps
}

/** A line marking one value or one x across the plot. The axis stretches to keep it in view. */
function ChartReferenceLine({
  value,
  x,
  label,
  color = 'neutral',
  variant = 'dashed',
  engineProps,
}: ChartReferenceLineProps) {
  const { layout } = useChart('Chart.ReferenceLine')
  const { stroke } = resolveColor(color)
  const across = layout === 'horizontal'
  const position =
    value !== undefined ? (across ? { y: value } : { x: value }) : across ? { x } : { y: x }
  return (
    <ReferenceLine
      {...position}
      stroke={stroke}
      strokeWidth={1.5}
      strokeDasharray={variant === 'dashed' ? '4 4' : undefined}
      ifOverflow="extendDomain"
      label={
        label
          ? {
              value: label,
              position: value !== undefined && across ? 'insideTopRight' : 'insideTopLeft',
              className: 'kiln-reference-label',
            }
          : undefined
      }
      {...engineProps}
    />
  )
}

export {
  Area_ as ChartArea,
  Bar_ as ChartBar,
  ChartGrid,
  Line_ as ChartLine,
  ChartReferenceLine,
  ChartXAxis,
  ChartYAxis,
}
