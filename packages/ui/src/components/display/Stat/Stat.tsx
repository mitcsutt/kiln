import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import { Delta, type DeltaDirection, type DeltaTone } from '#components/display/Delta'
import styles from './Stat.module.css'

export type StatSize = 'sm' | 'md' | 'lg' | 'hero'
export type StatDeltaDirection = DeltaDirection
export type StatDeltaTone = DeltaTone
/** Colour of the figure. `default` is ink; use a tone only when the number itself is the news. */
export type StatTone = 'default' | 'positive' | 'critical' | 'accent'

export interface StatDelta {
  /** The change, already formatted: "+$212.40", "3 places", "4.1%". */
  value: ReactNode
  direction: StatDeltaDirection
  /**
   * Whether the change is good. Defaults from direction (up → positive, down → critical),
   * so override it when down is good: costs that fell is `direction="down" tone="positive"`.
   */
  tone?: StatDeltaTone
}

export interface StatProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What the number is. Sentence case, short: "Revenue", "Seats used", "Days left". */
  label: ReactNode
  /** The figure. Usually `<Amount>`/`<Numeral>`; plain strings are set tabular too. */
  value: ReactNode
  /** Change against a comparison period, shown beside the value. */
  delta?: StatDelta
  /** One line of context under the value: "of $60,000 target", "after 3 sprints". */
  hint?: ReactNode
  /** Default `md`. `hero` is for the one figure a page is about. */
  size?: StatSize
  /** A hairline above the label — lines up a row of stats like ledger columns. */
  rule?: boolean
  /** Colour of the value: an overrun in `critical`, the live total in `accent`. Default ink. */
  tone?: StatTone
}

/**
 * A single labelled figure. Typographic, not decorative: label, number, and the change
 * on one baseline — no tile, no icon, no gradient.
 *
 * <Stat label="Costs" value="$4,812.40" delta={{ value: '$212.40', direction: 'up', tone: 'critical' }} />
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, delta, hint, size = 'md', rule = false, tone, className, ...rest },
  ref,
) {
  const labelId = useId()
  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={labelId}
      className={cx(styles.stat, className)}
      data-size={size}
      data-rule={rule || undefined}
      data-tone={tone && tone !== 'default' ? tone : undefined}
      {...rest}
    >
      <div id={labelId} className={styles.label}>
        {label}
      </div>
      <div className={styles.figure}>
        <span className={styles.value}>{value}</span>
        {delta ? (
          <Delta className={styles.delta} direction={delta.direction} tone={delta.tone}>
            {delta.value}
          </Delta>
        ) : null}
      </div>
      {hint ? <div className={styles.hint}>{hint}</div> : null}
    </div>
  )
})
