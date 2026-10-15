import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react'

/** `useLayoutEffect` in the browser, a no-op on the server (where React warns about it). */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => {
    query.removeEventListener('change', onChange)
  }
}

/**
 * Whether the reader asked for reduced motion. The server and hydration assume they did: a chart
 * draws only in the browser, so the first drawing never animates by accident.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  )
}

export interface Size {
  width: number
  height: number
}

/**
 * The content size of the element in `ref`, kept current as it resizes (a window resize, a grid
 * cell dragged wider). `undefined` until measured, which is always on the server and on the
 * first client render, so hydration matches.
 */
export function useElementSize<E extends HTMLElement>(): [
  ref: RefObject<E | null>,
  size: Size | undefined,
] {
  const ref = useRef<E>(null)
  const [size, setSize] = useState<Size>()
  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      const width = element.clientWidth
      const height = element.clientHeight
      setSize((before) =>
        before?.width === width && before.height === height ? before : { width, height },
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [])
  return [ref, size]
}
