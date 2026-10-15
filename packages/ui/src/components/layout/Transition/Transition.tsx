import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
} from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import { useMergedRefs } from '#components/inputs/internal/refs'
import { useLatest } from '#components/inputs/internal/useLatest'
import styles from './Transition.module.css'

// Layout effects warn during server rendering; on the server nothing moves anyway.
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

export type TransitionPreset = 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'pop' | 'none'

export interface TransitionProps extends HTMLAttributes<HTMLElement> {
  /** Whether the element shows. Turning it on plays the enter animation, turning it off the exit. */
  open: boolean
  /**
   * How it enters and leaves. `fade` (default); `slide-up` and `slide-down` travel a short way
   * as they fade, for panels that come from below or above; `scale` grows slightly; `pop` lands
   * with the theme's spring. `none` leaves the animation to your own CSS (see the examples).
   */
  preset?: TransitionPreset
  /**
   * Keep the element in the page once it has left, `hidden`. Default `false`: it unmounts after
   * its exit animation finishes.
   */
  keepMounted?: boolean
  /** Play the enter animation when it first renders open. Default `false`. */
  appear?: boolean
  /** Runs when an enter or exit animation finishes, with the state it finished in. */
  onOpenChangeComplete?: (open: boolean) => void
  /** The one element to animate. It receives the class, data attributes and ref. */
  children: ReactElement
}

/** The longest of an element's computed animation durations, in milliseconds. */
function animationMs(element: HTMLElement): number {
  const style = getComputedStyle(element)
  if (!style.animationName || style.animationName === 'none') return 0
  const durations = style.animationDuration.split(',')
  const delays = style.animationDelay.split(',')
  let longest = 0
  durations.forEach((duration, index) => {
    const total = parseFloat(duration) + parseFloat(delays[index] ?? delays[0] ?? '0')
    if (Number.isFinite(total)) longest = Math.max(longest, total)
  })
  return longest * 1000
}

/**
 * Mounts an element with an enter animation and unmounts it after an exit animation.
 *
 * @remarks
 * `Transition` wraps one element and plays an animation when `open` turns on and another when it
 * turns off, keeping the element on screen until the exit has finished. Use it for something
 * that appears because of an action: a panel that slides up, a banner that fades in, a chat
 * window that opens. It adds no element of its own.
 *
 * The presets use the theme's durations and easings, so a Fiesta panel lands with a bounce and a
 * Ledger one doesn't. Under reduced motion every preset becomes an instant change.
 *
 * Nothing animates on the first render unless you pass `appear`, so content that's already open
 * when the page loads stays still.
 *
 * ## Your own animation
 *
 * With `preset="none"`, the element gets `data-state="open"` or `data-state="closed"` and no
 * animation of its own, so your CSS can run any keyframes on those states. `data-animate` is set
 * from the first change on, so including it keeps the first render still. `Transition` waits for
 * your exit animation to finish before it unmounts the element:
 *
 * ```css
 * .drawer[data-animate][data-state='open'] {
 *   animation: drawer-in var(--dur-3) var(--ease-out);
 * }
 * .drawer[data-animate][data-state='closed'] {
 *   animation: drawer-out var(--dur-2) var(--ease-in-out) both;
 * }
 * ```
 *
 * @privateRemarks
 * Presence without Radix's internal Presence (not exported from `radix-ui`): the exit waits for
 * `animationend`, with a timer from the computed duration in case it never comes. `data-animate`
 * appears on the first change (or at once with `appear`) and stays, so removing it can never
 * start an animation by itself.
 *
 * <Transition open={chatOpen} preset="slide-up"><ChatPanel /></Transition>
 */
export const Transition = forwardRef<HTMLElement, TransitionProps>(function Transition(
  {
    open,
    preset = 'fade',
    keepMounted = false,
    appear = false,
    onOpenChangeComplete,
    className,
    children,
    ...rest
  },
  ref,
) {
  const element = useRef<HTMLElement>(null)
  const complete = useLatest(onOpenChangeComplete)
  // On screen: true while open and while the exit animation runs.
  const [present, setPresent] = useState(open)
  if (open && !present) setPresent(true)
  const [animate, setAnimate] = useState(appear)
  const [previous, setPrevious] = useState(open)
  if (previous !== open) {
    setPrevious(open)
    setAnimate(true)
  }

  const first = useRef(!(appear && open))
  useIsomorphicLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const node = element.current
    const finish = () => {
      if (!open) setPresent(false)
      complete.current?.(open)
    }
    const duration = node ? animationMs(node) : 0
    if (!node || duration === 0) {
      finish()
      return
    }
    let done = false
    const end = () => {
      if (done) return
      done = true
      node.removeEventListener('animationend', onEnd)
      window.clearTimeout(timer)
      finish()
    }
    const onEnd = (event: AnimationEvent) => {
      if (event.target === node) end()
    }
    node.addEventListener('animationend', onEnd)
    // In case `animationend` never comes (the tab is in the background, the element was hidden).
    const timer = window.setTimeout(end, duration + 50)
    return () => {
      done = true
      node.removeEventListener('animationend', onEnd)
      window.clearTimeout(timer)
    }
  }, [open])

  const mergedRef = useMergedRefs(ref, element)
  if (!present && !keepMounted) return null
  return (
    <Slot.Root
      ref={mergedRef}
      className={cx(styles.transition, className)}
      data-state={open ? 'open' : 'closed'}
      data-preset={preset}
      data-animate={animate || undefined}
      hidden={!open && !present ? true : undefined}
      {...rest}
    >
      {children}
    </Slot.Root>
  )
})
