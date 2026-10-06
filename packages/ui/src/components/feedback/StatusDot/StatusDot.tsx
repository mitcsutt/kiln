import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import type { Tone } from '#utils/tokens'
import styles from './StatusDot.module.css'

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  /** State colour. Default `neutral`. */
  tone?: Tone
  /** What the colour means: "Paid", "Awaiting approval", "Deploying". Always required — colour alone is not information. */
  label: ReactNode
  /** Keep the label for screen readers only (e.g. in a dense table with a legend). */
  labelHidden?: boolean
  size?: 'sm' | 'md'
}

/**
 * A small static dot and a label, for states that sit still.
 *
 * @remarks
 * `StatusDot` pairs a tone with a word, so status never depends on colour alone. For "happening
 * now", use a {@link LiveIndicator | LiveIndicator}.
 *
 * @privateRemarks
 * A small static dot plus a label. For states that sit still; for "happening now" use LiveIndicator.
 */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  { tone = 'neutral', label, labelHidden = false, size = 'md', className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(styles.status, className)}
      data-tone={tone}
      data-size={size}
      data-label-hidden={labelHidden || undefined}
      {...rest}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={labelHidden ? styles.hidden : styles.label}>{label}</span>
    </span>
  )
})
