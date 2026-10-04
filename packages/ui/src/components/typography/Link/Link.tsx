import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import { ArrowUpRightIcon } from '#icons'
import styles from './Link.module.css'

export type LinkTone = 'default' | 'accent' | 'muted'
export type LinkUnderline = 'always' | 'hover'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `default` is ink with a quiet underline; `accent` for the one link that matters; `muted` for meta lines. */
  tone?: LinkTone
  /** `always` (default) for links inside prose; `hover` for links whose context already says "link" (nav, lists). */
  underline?: LinkUnderline
  /**
   * Opens in a new tab: sets `target="_blank"` + `rel="noopener noreferrer"`, adds a small
   * arrow and a visually-hidden "(opens in new tab)" for screen readers.
   */
  external?: boolean
  /**
   * Render the single child element instead of an <a>, merging props and styles.
   * Use for router links: `<Link asChild><RouterLink to="/work">Work</RouterLink></Link>`.
   */
  asChild?: boolean
}

/**
 * Inline text link. Hover thickens the underline instead of changing colour, so the
 * link stays legible in every theme.
 *
 * <Link href="https://github.com/mitcsutt/kiln" external>GitHub</Link>
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    tone = 'default',
    underline = 'always',
    external = false,
    asChild = false,
    className,
    children,
    target,
    rel,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot.Root : 'a'
  return (
    <Comp
      ref={ref}
      className={cx(styles.link, className)}
      data-tone={tone}
      data-underline={underline}
      data-external={external || undefined}
      target={external ? (target ?? '_blank') : target}
      rel={external ? (rel ?? 'noopener noreferrer') : rel}
      {...rest}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      {external ? (
        <>
          {/* The word joiner keeps the arrow from wrapping onto a line of its own */}
          <span className={styles.iconWrap} aria-hidden="true">
            {'\u2060'}
            <ArrowUpRightIcon className={styles.icon} />
          </span>
          <span className={styles.srOnly}> (opens in new tab)</span>
        </>
      ) : null}
    </Comp>
  )
})
