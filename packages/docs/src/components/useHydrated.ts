import { useSyncExternalStore } from 'react'

const subscribeNever = () => () => undefined

/** `false` while rendering on the server and hydrating, `true` after. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
}
