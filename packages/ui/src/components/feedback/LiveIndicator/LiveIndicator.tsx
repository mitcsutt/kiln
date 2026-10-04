import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import type { Size, Tone } from '#utils/tokens'
import styles from './LiveIndicator.module.css'

export type LiveIndicatorVariant = 'inline' | 'pill'

export interface LiveIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** What's live, or how far in: "Live", "72'", "Recording". Default "Live". */
  label?: ReactNode
  /** Colour of the dot (and the label in `inline`). Default `accent` — live *is* the accent's job. */
  tone?: Tone
  /** A ring that swells out of the dot. Stills under reduced motion. Default `true`. */
  pulse?: boolean
  /** `inline` sits in running text; `pill` is a keylined chip for match cards. */
  variant?: LiveIndicatorVariant
  size?: Exclude<Size, 'lg'>
}

/**
 * "This is happening now." A dot with a slow ring and a short label — for live matches,
 * an in-progress sync, a recording.
 *
 * Deliberately not a live region: a minute counter that announces itself every minute is
 * noise. If the change matters, announce it where it happens.
 */
export const LiveIndicator = forwardRef<HTMLSpanElement, LiveIndicatorProps>(function LiveIndicator(
  {
    label = 'Live',
    tone = 'accent',
    pulse = true,
    variant = 'inline',
    size = 'md',
    className,
    ...rest
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(styles.live, className)}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      data-pulse={pulse || undefined}
      {...rest}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </span>
  )
})
