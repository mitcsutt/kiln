import { forwardRef } from 'react'

import { Chart, type ChartProps } from '#components/Chart/Chart'
import { presetSeries, type SeriesConfig } from '#core/series'

export interface BarsProps extends Omit<ChartProps, 'children' | 'stacking'> {
  /**
   * The series to plot. Defaults to every numeric key in the rows (or every series `pivot` makes),
   * in order.
   */
  series?: readonly SeriesConfig[]
  /**
   * Stack the series into one bar per row: `true` adds them up, `percent` shows each one's share
   * of the row. @defaultValue false
   */
  stacked?: boolean | 'percent'
  /** Show the legend. @defaultValue true when there's more than one series */
  legend?: boolean
  /** A line across the plot at a value, such as a target. */
  target?: { value: number; label?: string }
}

/**
 * Bars that compare amounts across categories: one group of bars per row, side by side or
 * stacked.
 *
 * @remarks
 * Use `Bars` to compare amounts across a handful of categories or periods: orders by region,
 * hours by project, spend by month. Every numeric key in the rows is a series unless you name the
 * `series`; long rows work with `pivot`. `layout="vertical"` lays the bars across, which suits
 * long category names.
 *
 * `stacked` stacks the series into one bar per row, and `stacked="percent"` shows each series'
 * share of its row. For a ranked list of many categories, {@link BarList | BarList} reads better.
 *
 * `Bars` is a short composition of {@link Chart | Chart} parts. When you need something it doesn't
 * do, copy its source and change it.
 */
export const Bars = forwardRef<HTMLElement, BarsProps>(function Bars(
  {
    data,
    x,
    pivot,
    series: given,
    stacked = false,
    legend,
    target,
    layout = 'horizontal',
    ...rest
  },
  ref,
) {
  const { rows, series } = presetSeries(data, x, pivot, given)
  const showLegend = legend ?? series.length > 1
  // Stacked to 100%, the value axis reads shares; the tooltip and table keep the values.
  const share = stacked === 'percent' ? 'percent' : undefined
  return (
    <Chart
      ref={ref}
      data={rows}
      x={x}
      layout={layout}
      stacking={stacked === 'percent' ? 'percent' : 'normal'}
      {...rest}
    >
      <Chart.Grid />
      <Chart.XAxis format={layout === 'vertical' ? share : undefined} />
      <Chart.YAxis format={layout === 'horizontal' ? share : undefined} />
      {series.map((s) => (
        <Chart.Bar
          key={s.key}
          dataKey={s.key}
          label={s.label}
          color={s.color}
          format={s.format}
          stack={stacked !== false}
        />
      ))}
      {target ? <Chart.ReferenceLine value={target.value} label={target.label} /> : null}
      <Chart.Tooltip />
      {showLegend ? <Chart.Legend /> : null}
    </Chart>
  )
})
