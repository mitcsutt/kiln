// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- a .d.ts can't be imported, and this one ships the stylesheet declaration
/// <reference path="./stylesheets.d.ts" preserve="true" />
/*
 * @mitcsutt/kiln-charts public API. Everything a consumer may import lives here: no deep imports,
 * and no type or component of the chart engine underneath.
 */

// Presets: reach for these first
export { TimeSeries } from './components/TimeSeries'
export type { TimeSeriesProps, TimeSeriesSeries } from './components/TimeSeries'
export { Bars } from './components/Bars'
export type { BarsProps } from './components/Bars'
export { Share } from './components/Share'
export type { ShareProps } from './components/Share'
export { BarList } from './components/BarList'
export type { BarListProps } from './components/BarList'
export { Sparkline } from './components/Sparkline'
export type { SparklineProps } from './components/Sparkline'
export { Heatmap } from './components/Heatmap'
export type { HeatmapProps } from './components/Heatmap'

// Composable charts
export { Chart } from './components/Chart'
export type {
  ChartProps,
  ChartPoint,
  ChartZoomRange,
  ChartBarProps,
  ChartLineProps,
  ChartAreaProps,
  ChartGridProps,
  ChartXAxisProps,
  ChartYAxisProps,
  ChartReferenceLineProps,
  ChartTooltipPartProps,
  ChartLegendPartProps,
  ChartZoomProps,
  ChartSeriesProps,
  ChartCurve,
  ChartWeight,
  ChartLayout,
  EngineProps,
} from './components/Chart'

// Building blocks
export { ChartFrame } from './components/ChartFrame'
export type { ChartFrameProps, ChartHeight, ChartStatus } from './components/ChartFrame'
export { ChartTooltip } from './components/ChartTooltip'
export type { ChartTooltipProps, ChartTooltipItem } from './components/ChartTooltip'
export { ChartLegend } from './components/ChartLegend'
export type { ChartLegendProps, ChartLegendItem } from './components/ChartLegend'
export { ChartColorScope } from './components/ChartColorScope'
export type { ChartColorScopeProps } from './components/ChartColorScope'

// Data, colour and formatting
export type {
  ChartColor,
  ChartColorToken,
  ChartTone,
  SequentialStep,
  DivergingStep,
} from './core/colors'
export type { ChartRow, ChartTable, PivotOptions } from './core/data'
export type { SeriesConfig } from './core/series'
export type { ValueFormat, XFormat } from './core/format'
