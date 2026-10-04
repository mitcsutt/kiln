import { useEffect, useLayoutEffect, useRef } from 'react'

// Layout effects warn during server rendering; on the server there's nothing to sync anyway.
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

/**
 * A ref that always holds the latest `value`, updated after render. Lets a stable callback
 * call the newest `onChange` without being re-created every render.
 */
export function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value)
  useIsomorphicLayoutEffect(() => {
    ref.current = value
  })
  return ref
}
