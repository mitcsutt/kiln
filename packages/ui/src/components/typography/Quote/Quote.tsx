import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import styles from './Quote.module.css'

export type QuoteSize = 'sm' | 'md' | 'lg'

export interface QuoteProps extends HTMLAttributes<HTMLElement> {
  /** Who said it. A name, or a name plus role: `<>Rosa Nguyen<br />Head of design</>`. */
  cite?: ReactNode
  /** URL of the source, set on the <blockquote cite> attribute. */
  citeUrl?: string
  /**
   * `sm` a testimonial in the prose face; `md` (default) a pull quote in the display
   * face; `lg` the one quote a page is built around.
   */
  size?: QuoteSize
}

/**
 * A pull quote or testimonial, with a hanging opening mark and an attribution.
 *
 * @remarks
 * `Quote` sets the opening mark in its own column in the display face, the way a typographer hangs
 * punctuation, rather than drawing a coloured bar down the side.
 *
 * @privateRemarks
 * A pull quote or testimonial. The opening mark hangs in its own column in the display
 * face — the typographer's treatment, not a coloured bar down the side.
 *
 * <Quote cite="Ada Okafor">Software should stay out of the way.</Quote>
 */
export const Quote = forwardRef<HTMLElement, QuoteProps>(function Quote(
  { cite, citeUrl, size = 'md', className, children, ...rest },
  ref,
) {
  return (
    <figure
      ref={ref}
      className={cx(styles.quote, className)}
      data-kiln-component=""
      data-size={size}
      {...rest}
    >
      <span className={styles.mark} aria-hidden="true">
        {'“'}
      </span>
      <blockquote className={styles.body} cite={citeUrl}>
        {children}
      </blockquote>
      {cite ? <figcaption className={styles.cite}>{cite}</figcaption> : null}
    </figure>
  )
})
