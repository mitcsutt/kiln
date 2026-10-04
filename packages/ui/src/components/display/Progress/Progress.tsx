import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Progress as ProgressPrimitive } from 'radix-ui'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import type { Size, Tone } from '#utils/tokens'
import styles from './Progress.module.css'

export interface ProgressProps extends Omit<
  ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
  'value' | 'max' | 'children'
> {
  /** Current value. `null` or omitted = indeterminate (working, amount unknown). */
  value?: number | null
  /** Default 100. */
  max?: number
  /** Default `accent`. */
  tone?: Tone
  /** Bar thickness. */
  size?: Size
  /** Visible label above the bar; also its accessible name. */
  label?: ReactNode
  /** Show the value at the end of the label row. */
  showValue?: boolean
  /** Formats the visible value and `aria-valuetext`. Default: whole percent. */
  formatValue?: (value: number, max: number) => string
}

const percent = (value: number, max: number) => `${String(Math.round((value / max) * 100))}%`

/**
 * How far along a task is: an upload, an import, a sync in progress.
 * For a quantity against a limit (spent vs budget) use `Meter` instead.
 *
 * `ref` and native/ARIA props land on the `progressbar` element; `className` and `style`
 * on the outer wrapper (label row + track).
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value = null,
    max = 100,
    tone = 'accent',
    size = 'md',
    label,
    showValue = false,
    formatValue = percent,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const labelId = useId()
  const determinate = value !== null && Number.isFinite(value)
  const clamped = determinate ? Math.min(Math.max(value, 0), max) : 0
  const valueText = determinate ? formatValue(clamped, max) : undefined

  return (
    <div className={cx(styles.progress, className)} style={style} data-tone={tone} data-size={size}>
      {label || (showValue && determinate) ? (
        <div className={styles.header}>
          {label ? (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          ) : null}
          {showValue && determinate ? (
            <span className={styles.value} aria-hidden="true">
              {valueText}
            </span>
          ) : null}
        </div>
      ) : null}
      <ProgressPrimitive.Root
        ref={ref}
        className={styles.track}
        value={determinate ? clamped : null}
        max={max}
        getValueLabel={(v, m) => formatValue(v, m)}
        aria-label={ariaLabel}
        aria-labelledby={label && !ariaLabel ? labelId : undefined}
        {...rest}
      >
        <ProgressPrimitive.Indicator
          className={styles.indicator}
          style={mergeStyles(
            determinate ? ({ '--progress-fraction': clamped / max } as CSSProperties) : undefined,
          )}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})
