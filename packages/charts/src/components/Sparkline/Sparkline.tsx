import { cx } from '@mitcsutt/kiln-ui'
import { forwardRef, useMemo, type HTMLAttributes, type ReactNode } from 'react'

import { ChartFrame, type ChartStatus } from '#components/ChartFrame/ChartFrame'
import { resolveColor, type ChartColor } from '#core/colors'
import { humanise, summarise, tableOf, type ChartRow, type PivotOptions } from '#core/data'
import { valueFormatter, xFormatter, type ValueFormat, type XFormat } from '#core/format'
import { presetSeries } from '#core/series'
import { cssVars } from '#core/style'

import styles from './Sparkline.module.css'

export interface SparklineProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The points: rows with a value (and an x for the data table), or plain numbers. */
  data: readonly ChartRow[] | readonly number[]
  /** The key of each row's x value, for the data table and summary. */
  x?: string
  /** The key of the value to plot. Defaults to the first numeric key. */
  dataKey?: string
  /** Long rows: plots the first series `pivot` makes. */
  pivot?: PivotOptions
  /** The sparkline's accessible name, such as "Orders, last 14 days". */
  label: string
  /** What the data says. Defaults to the range of values. */
  summary?: string
  /** @defaultValue 'line' */
  variant?: 'line' | 'area' | 'bar'
  /** @defaultValue 'accent' */
  color?: ChartColor
  /** Pixels. The sparkline fills its width. @defaultValue 32 */
  height?: number
  /** Mark the last point, the one a reader looks for first. @defaultValue true */
  showLast?: boolean
  /** How to write values in the summary and table. @defaultValue 'number' */
  format?: ValueFormat
  /** How to write x values that are dates. @defaultValue 'date' */
  xFormat?: XFormat
  locale?: string
  timeZone?: string
  status?: ChartStatus
  emptyMessage?: ReactNode
  errorMessage?: ReactNode
}

/** Plot coordinates in a 100 × 100 box; the SVG stretches it to the frame. */
interface Point {
  x: number
  y: number | undefined
}

function linePath(points: readonly Point[]): string {
  let path = ''
  let pen = false
  for (const point of points) {
    if (point.y === undefined) {
      pen = false
      continue
    }
    path += `${pen ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    pen = true
  }
  return path
}

function areaPaths(points: readonly Point[], base: number): string[] {
  const runs: Point[][] = [[]]
  for (const point of points) {
    if (point.y === undefined) runs.push([])
    else runs.at(-1)?.push(point)
  }
  return runs
    .filter((run) => run.length > 1)
    .map((run) => {
      const first = run[0]
      const last = run.at(-1)
      if (!first || !last) return ''
      return `${linePath(run)}L${last.x.toFixed(2)} ${base.toFixed(2)}L${first.x.toFixed(2)} ${base.toFixed(2)}Z`
    })
}

/**
 * A word-sized line of values with no axes, for a trend beside a number.
 *
 * @remarks
 * Put a `Sparkline` next to a figure to show where it's heading: a {@link Stat} tile, a table
 * row, a card header. It fills its width at a small `height` and marks the last point. `area`
 * fills below the line, and `bar` draws one bar per value.
 *
 * It's plain SVG, so it renders completely on the server and costs no chart engine. It has an
 * accessible name and summary, and its values as a visually hidden table.
 */
export const Sparkline = forwardRef<HTMLElement, SparklineProps>(function Sparkline(
  {
    data,
    x,
    dataKey,
    pivot,
    label,
    summary,
    variant = 'line',
    color = 'accent',
    height = 32,
    showLast = true,
    format = 'number',
    xFormat,
    locale,
    timeZone,
    status,
    emptyMessage,
    errorMessage,
    className,
    ...rest
  },
  ref,
) {
  const rowsIn = useMemo<readonly ChartRow[]>(
    () =>
      data.map((item: ChartRow | number, index) =>
        typeof item === 'number' ? { point: index + 1, value: item } : item,
      ),
    [data],
  )
  const plain = data.length > 0 && typeof data[0] === 'number'
  const xKey = plain ? 'point' : (x ?? '')
  const { rows, series } = presetSeries(rowsIn, xKey, pivot, undefined)
  const key = dataKey ?? (plain ? 'value' : series[0]?.key) ?? ''
  const formatValue = useMemo(() => valueFormatter(format, { locale }), [format, locale])
  const formatX = useMemo(
    () => xFormatter(xFormat, { locale, timeZone }),
    [xFormat, locale, timeZone],
  )

  const values = rows.map((row) => {
    const value = row[key]
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined
  })
  const present = values.filter((value) => value !== undefined)
  const low = Math.min(...present, variant === 'bar' ? 0 : Infinity)
  const high = Math.max(...present, variant === 'bar' ? 0 : -Infinity)
  const span = high - low
  // A little room at the top and bottom, so a stroke on the extremes isn't clipped.
  const toY = (value: number) => (span === 0 ? 50 : 96 - ((value - low) / span) * 92)
  const step = values.length > 1 ? 100 / (values.length - 1) : 0
  const points: Point[] = values.map((value, index) => ({
    x: values.length > 1 ? index * step : 50,
    y: value === undefined ? undefined : toY(value),
  }))
  const last = points.findLast((point) => point.y !== undefined)

  const described = [{ key, label: pivot ? key : humanise(key), format: formatValue }]
  const xLabel = plain ? 'Point' : humanise(xKey)
  const { fill, stroke } = resolveColor(color)
  const barWidth = values.length > 0 ? 100 / values.length : 0

  return (
    <ChartFrame
      ref={ref}
      label={label}
      summary={summary ?? summarise(rows, xKey, formatX, described)}
      height={height}
      status={status ?? (present.length === 0 ? 'empty' : 'ready')}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      table={tableOf(rows, xKey, xLabel, formatX, described)}
      className={cx(styles.sparkline, className)}
      {...rest}
    >
      <div className={styles.plot} style={cssVars({ '--_fill': fill, '--_stroke': stroke })}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
          focusable="false"
          className={styles.svg}
        >
          {variant === 'bar'
            ? values.map((value, index) => {
                if (value === undefined) return null
                const top = toY(Math.max(value, 0))
                const bottom = toY(Math.min(value, 0))
                return (
                  <rect
                    key={index}
                    x={index * barWidth + barWidth * 0.15}
                    width={barWidth * 0.7}
                    y={top}
                    height={Math.max(bottom - top, 0.5)}
                    className={styles.bar}
                  />
                )
              })
            : null}
          {variant === 'area'
            ? areaPaths(points, toY(Math.max(low, 0))).map((path) => (
                <path key={path} d={path} className={styles.area} />
              ))
            : null}
          {variant !== 'bar' ? <path d={linePath(points)} className={styles.line} /> : null}
        </svg>
        {showLast && last?.y !== undefined && variant !== 'bar' ? (
          <span
            aria-hidden
            className={styles.last}
            style={cssVars({ '--_x': `${String(last.x)}%`, '--_y': `${String(last.y)}%` })}
          />
        ) : null}
      </div>
    </ChartFrame>
  )
})
