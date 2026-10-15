import { useCallback, useSyncExternalStore } from 'react'

/** A minimal external store: components subscribe to the slice they draw. */
export interface Store<T> {
  get: () => T
  set: (patch: Partial<T>) => void
  subscribe: (listener: () => void) => () => void
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch }
      for (const listener of listeners) listener()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

/**
 * The part of a store's state a component reads. Return a primitive (or a stable value)
 * from `select`, so a component re-renders only when its own slice changes.
 */
export function useStore<T, S>(store: Store<T>, select: (state: T) => S): S {
  const getSnapshot = useCallback(() => select(store.get()), [store, select])
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
}
