import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import type { Responsive } from '#utils/responsive'
import { Heading, type HeadingLevel, type HeadingSize } from '#components/typography/Heading'
import styles from './SectionHeader.module.css'

export type SectionHeaderElement = 'div' | 'header'

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The section or page title. Rendered as a <Heading>. */
  title: ReactNode
  /** Heading level. Default 2 (use 1 for a page header). */
  level?: HeadingLevel
  /** Heading size; defaults from `level`. Responsive. */
  size?: Responsive<HeadingSize>
  /** A sentence or two under the title. */
  description?: ReactNode
  /** Buttons or links. Right of the title from `md` up; below it on small screens. */
  actions?: ReactNode
  /**
   * Small context above the title — only when it tells the reader something
   * ("2025–26 financial year", "Group B"). Plain muted text, never a tracked-caps eyebrow.
   */
  kicker?: ReactNode
  /** A hairline under the header. */
  divider?: boolean
  as?: SectionHeaderElement
  /** Id for the heading, so a surrounding <section aria-labelledby> can point at it. */
  titleId?: string
}

/**
 * The title block for a page or section: optional kicker, heading, description and
 * actions. Title, kicker and description are grouped in an <hgroup>.
 *
 * <SectionHeader title="September spending" description="$4,182.60 of $5,200 budgeted" actions={<Button>Export CSV</Button>} />
 */
export const SectionHeader = forwardRef<HTMLElement, SectionHeaderProps>(function SectionHeader(
  {
    title,
    level = 2,
    size,
    description,
    actions,
    kicker,
    divider = false,
    as: Comp = 'div',
    titleId,
    className,
    ...rest
  },
  ref,
) {
  return (
    <Comp
      // @ts-expect-error — polymorphic ref across a union of intrinsic elements is safe here
      ref={ref}
      className={cx(styles.header, className)}
      data-divider={divider || undefined}
      data-has-actions={actions ? true : undefined}
      {...rest}
    >
      <hgroup className={styles.titles}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <Heading id={titleId} level={level} size={size} className={styles.title}>
          {title}
        </Heading>
        {description ? <div className={styles.description}>{description}</div> : null}
      </hgroup>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </Comp>
  )
})
