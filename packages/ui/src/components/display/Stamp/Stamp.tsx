import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import type { Size, Tone } from '#utils/tokens'
import styles from './Stamp.module.css'

export type StampPlacement = 'inline' | 'corner'

export interface StampProps extends HTMLAttributes<HTMLSpanElement> {
  /** Ink colour. Default `critical` — stamps are usually verdicts. */
  tone?: Tone
  /** Tilt in degrees. Keep it small (−10 to 10); default −6. `0` for a square stamp. */
  rotate?: number
  size?: Size
  /**
   * `inline` (default) sits in the flow. `corner` is pinned to the top-end corner of the
   * nearest positioned ancestor — a <Card> is positioned — so stamping an object never
   * changes its height.
   */
  placement?: StampPlacement
}

/**
 * A rubber-stamp verdict like Paid, Void or Cancelled. A double rule in the display face, knocked
 * off square.
 *
 * @remarks
 * `Stamp` is a verdict, stamped on the thing it judges: a refunded ticket, a void invoice. It's
 * decorative but deliberate, so use one per object.
 *
 * @privateRemarks
 * A rubber-stamp verdict: "Rejected", "Paid", "Void". A double rule in the display
 * face, knocked slightly off square. Decorative but deliberate — use one per object,
 * on the thing it judges.
 *
 * It reads as its text; pass `aria-label` when the visible word needs more context
 * ("Invoice 1039 overdue by 12 days").
 */
export const Stamp = forwardRef<HTMLSpanElement, StampProps>(function Stamp(
  { tone = 'critical', rotate = -6, size = 'md', placement = 'inline', className, style, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(styles.stamp, className)}
      data-tone={tone}
      data-size={size}
      data-placement={placement === 'corner' ? 'corner' : undefined}
      style={mergeStyles({ '--stamp-rotate': `${String(rotate)}deg` } as CSSProperties, style)}
      {...rest}
    />
  )
})
