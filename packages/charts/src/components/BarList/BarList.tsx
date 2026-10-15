import { cx } from '@mitcsutt/kiln-ui'
import { forwardRef, useMemo, type HTMLAttributes, type ReactNode } from 'react'

import { ChartFrame, type ChartStatus } from '#components/ChartFrame/ChartFrame'
import { resolveColor, type ChartColor } from '#core/colors'
import { humanise, type ChartRow, type PivotOptions } from '#core/data'
import { valueFormatter, type ValueFormat } from '#core/format'
import { presetEntries } from '#core/series'
import { cssVars } from '#core/style'

import styles from './BarList.module.css'

export interface BarListProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * The items. Wide: one row whose numeric keys are the items (`{ harbour: 120, quay: 84 }`).
   * Long: one row per item, with `pivot` naming the item and amount keys.
   */
  data: readonly ChartRow[]
  /**
   * Long rows: `by` names each item and `value` holds its amount. Every item is kept unless you
   * set a `limit`.
   */
  pivot?: PivotOptions
  /** The list's accessible name, such as "Top pages by views". */
  label: string
  /** What the data says. Defaults to the count and the largest item. */
  summary?: string
  /** How to write amounts. @defaultValue 'number' */
  format?: ValueFormat
  /** The locale for numbers, passed to `Intl`. */
  locale?: string
  /**
   * Names for the items, by key. Defaults to each `pivot` value as written, or a readable form
   * of each wide key (`unitsSold` reads "Units sold").
   */
  labels?: Readonly<Record<string, string>>
  /** The bars' colour. Bars measure amounts, so a ramp step suits. @defaultValue 'seq-5' */
  color?: ChartColor
  /** Show only the largest this many. */
  max?: number
  /** `descending` ranks the items; `none` keeps their order. @defaultValue 'descending' */
  sort?: 'descending' | 'none'
  status?: ChartStatus
  emptyMessage?: ReactNode
  errorMessage?: ReactNode
  action?: ReactNode
}

/**
 * A ranked list of named amounts, each with a bar: top pages, busiest stops, largest customers.
 *
 * @remarks
 * `BarList` reads like a list because it is one: each item is its name and amount as text, with
 * a bar below the name sized against the largest. It suits more categories than
 * {@link Bars | Bars} does, long names, and narrow spaces such as a sidebar or a card. Items are
 * ranked largest first unless you pass `sort="none"`, and `max` keeps only the top few.
 *
 * It's plain HTML, so it renders completely on the server, and a screen reader reads it as an
 * ordered list of names and amounts.
 */
export const BarList = forwardRef<HTMLElement, BarListProps>(function BarList(
  {
    data,
    pivot,
    label,
    summary,
    format = 'number',
    locale,
    labels,
    color = 'seq-5',
    max,
    sort = 'descending',
    status,
    emptyMessage,
    errorMessage,
    action,
    className,
    style,
    ...rest
  },
  ref,
) {
  const { entries } = useMemo(
    () => presetEntries(data, pivot ? { limit: false, ...pivot } : undefined),
    [data, pivot],
  )
  const ranked = sort === 'descending' ? [...entries].sort((a, b) => b.value - a.value) : entries
  const items = max === undefined ? ranked : ranked.slice(0, max)
  const largest = Math.max(0, ...items.map((item) => Math.abs(item.value)))
  const formatValue = useMemo(() => valueFormatter(format, { locale }), [format, locale])
  const nameOf = (key: string) => labels?.[key] ?? (pivot ? key : humanise(key))
  const first = items[0]
  const description =
    summary ??
    (first
      ? `${String(items.length)} items. The largest is ${nameOf(first.key)} at ${formatValue(first.value)}.`
      : 'No data.')
  const { fill, stroke } = resolveColor(color)

  return (
    <ChartFrame
      ref={ref}
      label={label}
      summary={description}
      height="auto"
      status={status ?? (items.length === 0 ? 'empty' : 'ready')}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      action={action}
      className={cx(styles.barList, className)}
      style={style}
      {...rest}
    >
      <ol className={styles.list} style={cssVars({ '--_fill': fill, '--_stroke': stroke })}>
        {items.map((item) => (
          <li key={item.key} className={styles.item}>
            <span className={styles.name}>{nameOf(item.key)}</span>
            <span className={styles.value}>{formatValue(item.value)}</span>
            <span
              aria-hidden
              className={styles.bar}
              style={cssVars({
                '--_size': `${String(largest === 0 ? 0 : (Math.abs(item.value) / largest) * 100)}%`,
              })}
            />
          </li>
        ))}
      </ol>
    </ChartFrame>
  )
})
