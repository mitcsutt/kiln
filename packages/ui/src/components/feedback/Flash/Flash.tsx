import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
} from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import { useMergedRefs } from '#components/inputs/internal/refs'
import styles from './Flash.module.css'

/**
 * Whether any Flash has committed yet. Elements present at the first commit (the server render
 * and its hydration included) never flash on `appear`, so a page doesn't light up as it loads.
 */
let pageRendered = false

export interface FlashProps extends HTMLAttributes<HTMLElement> {
  /**
   * Flashes each time this changes after the first render: a score, a count, an updated-at
   * time. Compared with `Object.is`.
   */
  value?: unknown
  /**
   * Flash once when the element mounts, for something that's new because of a change: the row
   * a new goal adds. It doesn't flash during the page's first render. Pass it only to elements
   * that are new, not to every row of a list that loads.
   */
  appear?: boolean
  /**
   * Flash when this turns `true`: the element is the place a link just opened on. For routers
   * that change the URL without the browser updating `:target` (most client-side routers).
   * Plain `#hash` links and `hashchange`/`popstate` navigation are caught without it.
   */
  target?: boolean
  /** The one element to flash. It receives the class, data attribute and ref. */
  children: ReactElement
}

/**
 * Draws brief attention to an element that just changed, or that a link just jumped to.
 *
 * @remarks
 * `Flash` wraps any single element, a list row, a card, a figure, and gives it a short outline
 * in the accent that fades away. It adds no element of its own. It flashes:
 *
 * - each time `value` changes after the first render;
 * - once on mount with `appear`, for an element that's new because of a change;
 * - when the element is the URL's `#target`, on a page load, a `#hash` link or back and forward;
 * - when `target` turns `true`, for a client-side router, which changes the URL without
 *   updating `:target`: `target={location.hash === '#match-123'}`.
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
  { value, appear = false, target = false, className, children, ...rest },
  ref,
) {
  const element = useRef<HTMLElement>(null)
  const [count, setCount] = useState(() => ((appear && pageRendered) || target ? 1 : 0))
  const [seen, setSeen] = useState({ value, target })
  if (!Object.is(seen.value, value) || seen.target !== target) {
    setSeen({ value, target })
    if (!Object.is(seen.value, value) || (target && !seen.target)) setCount(count + 1)
  }

  useEffect(() => {
    pageRendered = true
    // `:target` covers page loads; these cover hash links and history moves after it.
    const check = () => {
      const id = element.current?.id
      if (id && window.location.hash === `#${id}`) setCount((n) => n + 1)
    }
    window.addEventListener('hashchange', check)
    window.addEventListener('popstate', check)
    return () => {
      window.removeEventListener('hashchange', check)
      window.removeEventListener('popstate', check)
    }
  }, [])

  return (
    <Slot.Root
      ref={useMergedRefs(ref, element)}
      className={cx(styles.flash, className)}
      data-flash={count === 0 ? undefined : count % 2 ? 'odd' : 'even'}
      {...rest}
    >
      {children}
    </Slot.Root>
  )
})
