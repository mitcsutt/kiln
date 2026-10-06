import { forwardRef, useState, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import styles from './Flash.module.css'

export interface FlashProps extends HTMLAttributes<HTMLElement> {
  /**
   * Flashes each time this changes after the first render: a score, a count, an updated-at
   * time. Compared with `Object.is`. Omit to flash only when the element is the URL's `#target`.
   */
  value?: unknown
  /** The one element to flash. It receives the class, data attribute and ref. */
  children: ReactElement
}

/**
 * Draws brief attention to an element that just changed, or that a link just jumped to.
 *
 * @remarks
 * `Flash` wraps any single element, a list row, a card, a figure, and gives it a short outline
 * in the accent that fades away. It flashes each time `value` changes after the first render,
 * and whenever the element is the URL's `#target`, so a link to `/fixtures#match-123` points at
 * the row it opens on. It adds no element of its own.
 *
 * With reduced motion the outline doesn't fade: it shows, holds, and goes. The colour and how
 * long it stays are the `--flash-color` and `--flash-duration` tokens.
 *
 * @privateRemarks
 * One primitive for "this just changed / you were sent here" instead of a flash prop on every
 * component (DESIGN.md §2 Motion: motion that shows a state change). An outline, so it never
 * shifts layout and works over any background. Two keyframe names alternate so each change
 * restarts the animation.
 *
 * <Flash value={goals}><List.Item>…</List.Item></Flash>
 */
export const Flash = forwardRef<HTMLElement, FlashProps>(function Flash(
  { value, className, children, ...rest },
  ref,
) {
  const [seen, setSeen] = useState(value)
  const [count, setCount] = useState(0)
  if (!Object.is(seen, value)) {
    setSeen(value)
    setCount(count + 1)
  }
  return (
    <Slot.Root
      ref={ref}
      className={cx(styles.flash, className)}
      data-flash={count === 0 ? undefined : count % 2 ? 'odd' : 'even'}
      {...rest}
    >
      {children}
    </Slot.Root>
  )
})
