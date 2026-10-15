import { cx } from '@mitcsutt/kiln-ui'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

import { Swatch, type SwatchShape } from '#components/internal/Swatch/Swatch'
import type { ChartColor } from '#core/colors'

import styles from './ChartLegend.module.css'

/** One entry of a legend: a series' name and colour. */
export interface ChartLegendItem {
  key: string
  label: ReactNode
  color: ChartColor
  /** `line` or `dashed` for a line series, `chip` (the default) for bars, areas and slices. */
  shape?: SwatchShape | undefined
  /** Whether the series is switched off. Only meaningful with `onToggleSeries`. */
  hidden?: boolean | undefined
  /** A value to show after the name, such as a total or a share. */
  value?: ReactNode
}

export interface ChartLegendProps extends HTMLAttributes<HTMLUListElement> {
  items: readonly ChartLegendItem[]
  /**
   * Makes each entry a toggle button that shows or hides its series. Without it the legend is a
   * plain list.
   */
  onToggleSeries?: (key: string) => void
}

/**
 * The names and colours of a chart's series, as a list or as toggles.
 *
 * @remarks
 * `Chart.Legend` and the presets draw their legends with it. Each entry is a colour swatch and the
 * series' name, written in ink rather than the series colour, so every name meets text contrast in
 * every theme. The swatch is decorative and hidden from screen readers: the name says it all.
 *
 * With `onToggleSeries`, each entry is a button whose pressed state says whether its series is shown, so
 * a reader can switch series off and on from the keyboard.
 */
export const ChartLegend = forwardRef<HTMLUListElement, ChartLegendProps>(function ChartLegend(
  { items, onToggleSeries, className, 'aria-label': ariaLabel = 'Legend', ...rest },
  ref,
) {
  return (
    <ul
      ref={ref}
      // `list-style: none` drops list semantics in Safari without the role.

      role="list"
      aria-label={ariaLabel}
      className={cx(styles.legend, className)}
      {...rest}
    >
      {items.map((item) => {
        const content = (
          <>
            <Swatch color={item.color} shape={item.shape} />
            <span className={styles.label}>{item.label}</span>
            {item.value !== undefined ? <span className={styles.value}>{item.value}</span> : null}
          </>
        )
        return (
          <li key={item.key} className={styles.item}>
            {onToggleSeries ? (
              <button
                type="button"
                className={styles.toggle}
                aria-pressed={!item.hidden}
                data-hidden={item.hidden ? '' : undefined}
                onClick={() => {
                  onToggleSeries(item.key)
                }}
              >
                {content}
              </button>
            ) : (
              <span className={styles.entry}>{content}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
})
