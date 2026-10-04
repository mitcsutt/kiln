import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import styles from './VisuallyHidden.module.css'

export type VisuallyHiddenElement = 'span' | 'div' | 'a' | 'h1' | 'h2' | 'h3' | 'label'

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  /**
   * Reveal the content while it (or something inside it) has keyboard focus —
   * for skip links and other keyboard-only affordances.
   */
  focusable?: boolean
  /** Default `span`. */
  as?: VisuallyHiddenElement
  /** Only for `as="a"`. */
  href?: string
}

/**
 * Content for screen readers only: a label for an icon-only control, a table caption,
 * a heading that the visual layout already implies.
 *
 * <VisuallyHidden as="h2">Open invoices</VisuallyHidden>
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { focusable = false, as: Comp = 'span', className, ...rest },
  ref,
) {
  return (
    <Comp
      // @ts-expect-error — polymorphic ref across a union of intrinsic elements is safe here
      ref={ref}
      className={cx(styles.hidden, className)}
      data-focusable={focusable || undefined}
      {...rest}
    />
  )
})
