import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import styles from './Spinner.module.css'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg' | 'inherit'
  /** Accessible label. Defaults to "Loading". Pass `null` when a parent already announces busy state. */
  label?: string | null
}

/**
 * Indeterminate progress. Three bars that fill in turn, not the stock spinning ring.
 *
 * @remarks
 * `Spinner` says something is happening without saying how long it'll take. It's three bars that
 * fill in turn, and it holds still under reduced motion.
 *
 * @privateRemarks
 * Indeterminate progress. Three bars that fill in turn — not the stock rotating ring.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'inherit', label = 'Loading', className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(styles.root, className)}
      data-size={size}
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
    </span>
  )
})
