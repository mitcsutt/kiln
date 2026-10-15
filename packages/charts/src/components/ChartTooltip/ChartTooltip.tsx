import { cx } from '@mitcsutt/kiln-ui'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

import { Swatch, type SwatchShape } from '#components/internal/Swatch/Swatch'
import type { ChartColor } from '#core/colors'

import styles from './ChartTooltip.module.css'

/** One row of a tooltip: a series, its colour and its value at the point. */
export interface ChartTooltipItem {
  /** A stable key for the row; the label is used when it's text. */
  key?: string
  label: ReactNode
  /** The value, already formatted. */
  value: ReactNode
  /** The series' colour, drawn as a swatch before the label. */
  color?: ChartColor | undefined
  /** `line` or `dashed` for a line series, `chip` (the default) for bars, areas and slices. */
  shape?: SwatchShape | undefined
}

export interface ChartTooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** What the point is: a date, a category. */
  title?: ReactNode
  items: readonly ChartTooltipItem[]
}

/**
 * The card a chart shows for the point under the pointer or the keyboard.
 *
 * @remarks
 * `Chart.Tooltip` and every preset draw their tooltips with it, so you only need it to show the
 * same card for something you draw yourself. It's a heading for the point and one row per series,
 * with the series' colour, its name and its value, in the theme's chart tooltip tokens
 * (`--chart-tooltip-surface`, `--chart-tooltip-border` and `--chart-tooltip-ink`). Values sit in a
 * column of tabular figures.
 *
 * The chart's tooltip is a polite live region, so a screen reader reads each point as the arrow
 * keys reach it.
 */
export const ChartTooltip = forwardRef<HTMLDivElement, ChartTooltipProps>(function ChartTooltip(
  { title, items, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx(styles.tooltip, className)} {...rest}>
      {title !== undefined && title !== null && title !== '' ? (
        <p className={styles.title}>{title}</p>
      ) : null}
      {items.length > 0 ? (
        <dl className={styles.items}>
          {items.map((item, index) => (
            <div
              key={item.key ?? (typeof item.label === 'string' ? item.label : index)}
              className={styles.item}
            >
              <dt className={styles.label}>
                {item.color !== undefined ? <Swatch color={item.color} shape={item.shape} /> : null}
                {item.label}
              </dt>
              <dd className={styles.value}>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
})
