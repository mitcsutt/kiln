import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import type { Size, Tone } from '#utils/tokens'
import { meterTone, type MeterThresholds } from './meterTone'
import styles from './Meter.module.css'

export type MeterTone = Extract<
  Tone,
  'positive' | 'caution' | 'critical' | 'accent' | 'neutral' | 'info'
>

export interface MeterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>, MeterThresholds {
  /** The measured amount. May exceed `max` (an overspent budget): the bar fills and `data-over` is set. */
  value: number
  /** Visible label; also the accessible name. */
  label?: ReactNode
  /** Replaces the default percentage, visibly and as `aria-valuetext`: "$578.40 of $680.00". */
  valueLabel?: string
  /** Show the value text in the label row. Default `true`. */
  showValue?: boolean
  /**
   * Force a tone. By default it's derived from `low`/`high`/`optimum` exactly like HTML
   * `<meter>` (optimum → positive, one region off → caution, two off → critical), or
   * `accent` when no thresholds are given.
   */
  tone?: MeterTone
  /** Divide the track into this many segments with ticks. */
  segments?: number
  size?: Size
}

/**
 * A measurement against a known range: spent vs budget, storage used, goals vs target.
 * Tone follows the thresholds, so 40% of the grocery budget is calm, 85% is a warning
 * and 110% is critical without the app deciding colours.
 *
 * <Meter label="Groceries" value={578.4} max={680} low={510} high={680} optimum={0}
 *        valueLabel="$578.40 of $680.00" />
 */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value,
    min = 0,
    max = 1,
    low,
    high,
    optimum,
    label,
    valueLabel,
    showValue = true,
    tone,
    segments,
    size = 'md',
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const labelId = useId()
  const range = max - min || 1
  const clamped = Math.min(Math.max(value, min), max)
  const fraction = (clamped - min) / range
  const hasThresholds = low !== undefined || high !== undefined || optimum !== undefined
  const resolvedTone: MeterTone =
    tone ?? (hasThresholds ? meterTone(value, { min, max, low, high, optimum }) : 'accent')
  const text = valueLabel ?? `${String(Math.round(((value - min) / range) * 100))}%`
  const ticks =
    segments && segments > 1
      ? Array.from({ length: segments - 1 }, (_, i) => (i + 1) / segments)
      : []

  return (
    <div
      ref={ref}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={text}
      aria-label={ariaLabel}
      aria-labelledby={label && !ariaLabel ? labelId : undefined}
      className={cx(styles.meter, className)}
      data-tone={resolvedTone}
      data-size={size}
      data-over={value > max || undefined}
      data-segmented={ticks.length ? '' : undefined}
      style={mergeStyles({ '--meter-fraction': fraction } as CSSProperties, style)}
      {...rest}
    >
      {label || showValue ? (
        <div className={styles.header}>
          {label ? (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          ) : null}
          {showValue ? (
            <span className={styles.value} aria-hidden="true">
              {text}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} />
        {ticks.map((at) => (
          <span key={at} className={styles.tick} style={{ '--meter-tick': at } as CSSProperties} />
        ))}
      </div>
    </div>
  )
})
