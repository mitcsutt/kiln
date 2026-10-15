import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { useLatest } from '#components/inputs/internal/useLatest'

// Layout effects warn during server rendering; on the server nothing moves anyway.
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

/** The longest of an element's computed transition durations, in milliseconds. */
function transitionMs(element: HTMLElement): number {
  const style = getComputedStyle(element)
  const durations = style.transitionDuration.split(',')
  const delays = style.transitionDelay.split(',')
  let longest = 0
  durations.forEach((duration, index) => {
    const total = parseFloat(duration) + parseFloat(delays[index] ?? delays[0] ?? '0')
    if (Number.isFinite(total)) longest = Math.max(longest, total)
  })
  return longest * 1000
}

/**
 * Animates an element's height whenever `key` changes, from the height it had before the change
 * to its natural height after it. Shared by `Collapse`, `ShowMore` and `NavLinks.Group`, so every
 * open and close in Kiln moves the same way.
 *
 * The element's CSS decides the natural height in each state (`block-size: 0` when closed, a
 * `max-block-size` clamp when collapsed) and the transition itself, through `data-animating`:
 * `.el[data-animating] { transition: block-size var(--dur-3) var(--ease-out) }`. While it's set,
 * the CSS should lift any clamp, since the inline `block-size` does the work. The theme's motion
 * tokens set the timing, and under reduced motion they collapse, so the change is instant.
 *
 * `onSettled` runs once the height reaches its new value (at once when nothing moves), with the
 * key it settled on. A change during a transition starts from wherever the height is.
 */
export function useHeightMotion<K>(
  ref: RefObject<HTMLElement | null>,
  key: K,
  onSettled?: (key: K) => void,
): void {
  const settled = useLatest(onSettled)
  // The height before a change: layout effects run after the DOM changes, so it's kept current
  // here instead, by an observer and at the end of every transition.
  const before = useRef<number | null>(null)
  const first = useRef(true)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      before.current = element.getBoundingClientRect().height
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [ref])

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (first.current) {
      first.current = false
      if (element) before.current = element.getBoundingClientRect().height
      return
    }
    if (!element) {
      settled.current?.(key)
      return
    }

    // Mid-transition, start from where it is now; otherwise from the last height we saw.
    const animating = element.hasAttribute('data-animating')
    const from = animating
      ? element.getBoundingClientRect().height
      : (before.current ?? element.getBoundingClientRect().height)
    element.style.blockSize = ''
    element.removeAttribute('data-animating')
    const to = element.getBoundingClientRect().height

    const finish = () => {
      element.style.blockSize = ''
      element.removeAttribute('data-animating')
      before.current = element.getBoundingClientRect().height
      settled.current?.(key)
    }

    element.setAttribute('data-animating', '')
    const duration = transitionMs(element)
    if (Math.abs(from - to) < 0.5 || duration === 0) {
      finish()
      return
    }

    element.style.blockSize = `${String(from)}px`
    // Read layout so the browser commits the start height before the transition target.
    element.getBoundingClientRect()
    element.style.blockSize = `${String(to)}px`

    let done = false
    const end = () => {
      if (done) return
      done = true
      element.removeEventListener('transitionend', onEnd)
      window.clearTimeout(timer)
      finish()
    }
    const onEnd = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === 'block-size') end()
    }
    element.addEventListener('transitionend', onEnd)
    // In case `transitionend` never comes (the element was hidden, or the tab is in the background).
    const timer = window.setTimeout(end, duration + 50)
    return () => {
      done = true
      element.removeEventListener('transitionend', onEnd)
      window.clearTimeout(timer)
    }
  }, [key])
}
