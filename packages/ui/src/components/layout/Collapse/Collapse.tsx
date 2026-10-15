import { forwardRef, useRef, useState, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { useMergedRefs } from '#components/inputs/internal/refs'
import { useHeightMotion } from './useHeightMotion'
import styles from './Collapse.module.css'

export interface CollapseProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the content shows. Changing it animates the height. */
  open: boolean
  /**
   * Keep the content in the page while it's closed (hidden, so it's out of the tab order and the
   * accessibility tree). `false` unmounts it once the close finishes, so its state resets. Default
   * `true`.
   */
  keepMounted?: boolean
  /** Runs when an open or close finishes, with the state it finished in. */
  onOpenChangeComplete?: (open: boolean) => void
}

/**
 * Animates its content open and closed by height. No trigger, no heading, nothing else.
 *
 * @remarks
 * `Collapse` is the bare show-and-hide that `Accordion` and `Collapsible` give you with a button
 * attached. Use it when something else decides whether the content shows: a switch that reveals
 * advanced options, a filter bar, a group of nav links. It grows from nothing to the content's
 * natural height and back, with the theme's motion tokens, and changes instantly when the reader
 * asks for reduced motion.
 *
 * Closed content is `hidden`, so it's out of the tab order and away from screen readers. Wire the
 * control that opens it with `aria-expanded` and `aria-controls` pointing at the `Collapse`'s
 * `id`, or use {@link Collapsible | Collapsible}, which does that for you.
 *
 * Put padding on the content inside it, not on the `Collapse` itself, so nothing shows while it's
 * closed.
 *
 * @privateRemarks
 * The shared height animation lives in `useHeightMotion` (also used by ShowMore and
 * NavLinks.Group): it measures from and to in px and transitions `block-size` on
 * `data-animating`, so it works in every browser without `interpolate-size`. Accordion keeps
 * Radix's own measured keyframes for now; moving it would change its markup.
 *
 * <Collapse open={advanced} id="advanced-options">…</Collapse>
 */
export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(function Collapse(
  { open, keepMounted = true, onOpenChangeComplete, className, children, ...rest },
  ref,
) {
  const element = useRef<HTMLDivElement>(null)
  // Whether the content is on screen: true while open and while a close is still animating.
  const [present, setPresent] = useState(open)
  if (open && !present) setPresent(true)

  useHeightMotion(element, open, (settledOpen) => {
    if (!settledOpen) setPresent(false)
    onOpenChangeComplete?.(settledOpen)
  })

  return (
    <div
      ref={useMergedRefs(ref, element)}
      className={cx(styles.collapse, className)}
      data-state={open ? 'open' : 'closed'}
      hidden={!open && !present}
      {...rest}
    >
      {present || keepMounted ? children : null}
    </div>
  )
})
