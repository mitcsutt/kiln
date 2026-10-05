import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import { VisuallyHidden } from '#components/layout/VisuallyHidden'
import styles from './Delta.module.css'

export type DeltaDirection = 'up' | 'down' | 'flat'
export type DeltaTone = 'positive' | 'critical' | 'neutral'

export interface DeltaProps extends HTMLAttributes<HTMLSpanElement> {
  /** Which way the figure moved. Drives the glyph and the spoken word ("Up", "Down"). */
  direction: DeltaDirection
  /**
   * Whether the change is good. Defaults from direction (up → positive, down → critical,
   * flat → neutral); override it when down is good — costs that fell are
   * `direction="down" tone="positive"`.
   */
  tone?: DeltaTone
  /** The change, already formatted: "1", "3 places", "$212.40". Omit for a bare glyph. */
  children?: ReactNode
}

const DIRECTION_LABEL: Record<DeltaDirection, string> = {
  up: 'Up',
  down: 'Down',
  flat: 'No change',
}
const DEFAULT_TONE: Record<DeltaDirection, DeltaTone> = {
  up: 'positive',
  down: 'critical',
  flat: 'neutral',
}

/**
 * A change marker: a small triangle (or a dot for no change) and the amount, coloured by
 * whether the change is good. The direction is spoken in words, so it never relies on
 * colour or the glyph: screen readers hear "Up 1".
 *
 * <Delta direction="up">1</Delta>  ·  <Delta direction="down" tone="positive">$84.20</Delta>
 */
export const Delta = forwardRef<HTMLSpanElement, DeltaProps>(function Delta(
  { direction, tone, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(styles.delta, className)}
      data-direction={direction}
      data-tone={tone ?? DEFAULT_TONE[direction]}
      {...rest}
    >
      <svg className={styles.glyph} viewBox="0 0 10 10" aria-hidden="true" focusable="false">
        {direction === 'flat' ? <circle cx="5" cy="5" r="2.5" /> : <path d="M5 1.5 9 8.5H1z" />}
      </svg>
      <VisuallyHidden>
        {DIRECTION_LABEL[direction]}
        {children != null ? ' ' : ''}
      </VisuallyHidden>
      {children}
    </span>
  )
})
