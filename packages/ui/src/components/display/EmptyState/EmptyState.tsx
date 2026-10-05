import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import styles from './EmptyState.module.css'

export type EmptyStateTitleElement = 'h1' | 'h2' | 'h3' | 'h4' | 'p'

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** What's empty, said plainly: "No invoices yet". */
  title: ReactNode
  /** What happens next, or why it's empty. One or two sentences. */
  description?: ReactNode
  /** The one thing to do about it — usually a single Button. */
  action?: ReactNode
  /** An illustration, photo or figure. Not a stock icon in a circle. */
  media?: ReactNode
  /** Default `start`. `center` is fine when the empty state is the whole view. */
  align?: 'start' | 'center'
  /**
   * Mark out the space with printer's crop marks at the four corners — reads as "this is
   * where things will go" without boxing it in.
   */
  framed?: boolean
  /** Heading element for the title. Default `h3`. */
  titleAs?: EmptyStateTitleElement
}

/**
 * What to show when there's nothing to show yet. A plain title, a line of direction, one action.
 *
 * @remarks
 * `EmptyState` replaces content that doesn't exist yet: no saved routes, no results for a filter.
 * It's typographic: a title that says what's empty, a sentence that says what to do, and one
 * action that does it.
 *
 * @privateRemarks
 * The view when there's nothing to show yet. Typographic: a plain title, a line of
 * direction, one action.
 *
 * <EmptyState title="No invoices yet" description="…" action={<Button>New invoice</Button>} />
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  {
    title,
    description,
    action,
    media,
    align = 'start',
    framed = false,
    titleAs: Title = 'h3',
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(styles.empty, className)}
      data-align={align}
      data-framed={framed || undefined}
      {...rest}
    >
      {framed ? <span className={styles.marks} aria-hidden="true" /> : null}
      {media ? <div className={styles.media}>{media}</div> : null}
      <div className={styles.copy}>
        <Title className={styles.title}>{title}</Title>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
})
