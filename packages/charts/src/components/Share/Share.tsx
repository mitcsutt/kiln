import { cx } from '@mitcsutt/kiln-ui'
import { forwardRef, useMemo, type HTMLAttributes, type ReactNode } from 'react'

import { ChartFrame, type ChartHeight, type ChartStatus } from '#components/ChartFrame/ChartFrame'
import { ChartLegend } from '#components/ChartLegend/ChartLegend'
import { useSeriesColors } from '#components/ChartColorScope/ChartColorScope'
import { resolveColor, type ChartColor } from '#core/colors'
import { humanise, type ChartRow, type PivotOptions } from '#core/data'
import { valueFormatter, type ValueFormat } from '#core/format'
import { presetEntries } from '#core/series'

import styles from './Share.module.css'

export interface ShareProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * The parts. Wide: one row whose numeric keys are the parts (`{ search: 5200, email: 1800 }`).
   * Long: one row per part, with `pivot` naming the part and amount keys.
   */
  data: readonly ChartRow[]
  /** Long rows: `by` names each part and `value` holds its amount. Past 8 parts, the smallest group as "Other". */
  pivot?: PivotOptions
  /** The chart's accessible name, such as "Visits by channel". */
  label: string
  /** What the data says. Defaults to each part's share, largest first. */
  summary?: string
  /** @defaultValue 200 */
  height?: ChartHeight
  /** How to write amounts. @defaultValue 'number' */
  format?: ValueFormat
  /** The locale for numbers, passed to `Intl`. */
  locale?: string
  /**
   * Names for the parts, by key. Defaults to each `pivot` value as written, or a readable form
   * of each wide key (`unitsSold` reads "Units sold").
   */
  labels?: Readonly<Record<string, string>>
  /** Colours pinned to some parts, by key. */
  colors?: Readonly<Record<string, ChartColor>>
  /** A word for the total in the middle, such as "visits". `false` leaves the middle empty. @defaultValue 'total' */
  totalLabel?: string | false
  status?: ChartStatus
  emptyMessage?: ReactNode
  errorMessage?: ReactNode
  action?: ReactNode
}

const RADIUS = 40
const WIDTH = 16
const GAP = 0.6

/**
 * Parts of a whole as a ring, with each part's amount and share in the legend beside it.
 *
 * @remarks
 * Use `Share` for a handful of parts that add up to something: visits by channel, spend by
 * category, seats by plan. The legend names every part with its amount and percentage, so the
 * ring is a picture of the shares and the numbers are always readable as text. Parts run
 * largest first, clockwise from the top. Past eight parts, the smallest are grouped as a neutral
 * "Other".
 *
 * It's plain SVG and HTML, so it renders completely on the server. To compare parts across
 * periods, use {@link Bars | Bars} with `stacked="percent"` instead.
 */
export const Share = forwardRef<HTMLElement, ShareProps>(function Share(
  {
    data,
    pivot,
    label,
    summary,
    height = 200,
    format = 'number',
    locale,
    labels,
    colors: pinned,
    totalLabel = 'total',
    status,
    emptyMessage,
    errorMessage,
    action,
    className,
    ...rest
  },
  ref,
) {
  const { entries, otherKey } = useMemo(() => presetEntries(data, pivot), [data, pivot])
  // Largest first, with "Other" last whatever its size.
  const parts = [...entries]
    .filter((entry) => entry.value > 0)
    .sort((a, b) => (a.key === otherKey ? 1 : b.key === otherKey ? -1 : b.value - a.value))
  const colors = useSeriesColors(
    parts.map(({ key }) => ({ key, color: pinned?.[key] })),
    otherKey,
  )
  const formatValue = useMemo(() => valueFormatter(format, { locale }), [format, locale])
  const formatShare = useMemo(() => valueFormatter('percent', { locale }), [locale])
  const total = parts.reduce((sum, part) => sum + part.value, 0)
  const nameOf = (key: string) => labels?.[key] ?? (pivot ? key : humanise(key))

  const description =
    summary ??
    (parts.length === 0
      ? 'No data.'
      : `${String(parts.length)} parts of ${formatValue(total)}. ${parts
          .map(
            (part) =>
              `${nameOf(part.key)}: ${formatShare(part.value / total)} (${formatValue(part.value)}).`,
          )
          .join(' ')}`)

  let start = 0
  const slices = parts.map((part) => {
    const length = (part.value / total) * 100
    const slice = { ...part, start, length }
    start += length
    return slice
  })

  return (
    <ChartFrame
      ref={ref}
      label={label}
      summary={description}
      height={height}
      status={status ?? (parts.length === 0 ? 'empty' : 'ready')}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      action={action}
      table={{
        columns: ['Part', 'Amount', 'Share'],
        rows: parts.map((part) => [
          nameOf(part.key),
          formatValue(part.value),
          formatShare(part.value / total),
        ]),
      }}
      className={cx(styles.share, className)}
      {...rest}
    >
      <div className={styles.layout}>
        <div className={styles.ring}>
          <svg viewBox="0 0 100 100" aria-hidden focusable="false" className={styles.svg}>
            <circle
              cx={50}
              cy={50}
              r={RADIUS}
              fill="none"
              strokeWidth={WIDTH}
              className={styles.track}
            />
            {slices.map((slice) => {
              const { fill } = resolveColor(colors.get(slice.key) ?? 'neutral')
              // Each slice is the ring's stroke, dashed to its length and turned to its start.
              const gap = slices.length > 1 ? Math.min(GAP, slice.length / 2) : 0
              return (
                <circle
                  key={slice.key}
                  cx={50}
                  cy={50}
                  r={RADIUS}
                  fill="none"
                  stroke={fill}
                  strokeWidth={WIDTH}
                  pathLength={100}
                  strokeDasharray={`${String(slice.length - gap)} ${String(100 - slice.length + gap)}`}
                  strokeDashoffset={String(25 - slice.start)}
                  className={styles.slice}
                  data-key={slice.key}
                />
              )
            })}
          </svg>
          {totalLabel !== false ? (
            <p className={styles.total} aria-hidden>
              <span className={styles.totalValue}>{formatValue(total)}</span>
              <span className={styles.totalLabel}>{totalLabel}</span>
            </p>
          ) : null}
        </div>
        <ChartLegend
          className={styles.legend}
          aria-label={`${label}: parts`}
          items={parts.map((part) => ({
            key: part.key,
            label: nameOf(part.key),
            color: colors.get(part.key) ?? 'neutral',
            value: `${formatShare(part.value / total)} · ${formatValue(part.value)}`,
          }))}
        />
      </div>
    </ChartFrame>
  )
})
