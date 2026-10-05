import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import type { Tone } from '#utils/tokens'
import styles from './Badge.module.css'

export type BadgeVariant = 'soft' | 'solid' | 'outline'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status colour. `neutral` for plain counts and labels. Default `neutral`. */
  tone?: Tone
  /** `soft` (default) for most status; `solid` for the one that must be seen; `outline` for quiet. */
  variant?: BadgeVariant
  size?: BadgeSize
  /** Leading status dot in the tone colour. Decorative — the label carries the meaning. */
  dot?: boolean
}

/**
 * A short word or count that says what state something is in. Live, delayed, 3 new.
 *
 * @remarks
 * A `Badge` is status: what state a thing is in right now. For categories and metadata (a line, a
 * facility, a topic) use a {@link Tag | Tag}, which is quieter.
 *
 * @privateRemarks
 * A short status or count: "Live", "Over quota", "3 new", "Overdue".
 * Metadata and categories are Tags; a Badge says what *state* something is in.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', variant = 'soft', size = 'sm', dot = false, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(styles.badge, className)}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  )
})
