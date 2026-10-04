import { useCallback, useRef, useState } from 'react'
import { sortByDomOrder } from '#core/runtime/focus'

export interface RegistryEntry {
  /** Unique within the registry (the tab / step `value`). */
  key: string
  /** The entry's panel element, used to keep entries in DOM order. */
  element(): HTMLElement | null
}

/**
 * Parts (tabs, steps) register with their container on mount, so wrapped parts (`When`, schema
 * node components) work and a hidden part drops out. Entries are kept in DOM order.
 */
export function useOrderedRegistry<E extends RegistryEntry>(): [
  readonly E[],
  (entry: E) => () => void,
] {
  const map = useRef(new Map<string, E>())
  const [entries, setEntries] = useState<readonly E[]>([])
  const sync = useCallback(() => {
    setEntries(sortByDomOrder([...map.current.values()]))
  }, [])
  const register = useCallback(
    (entry: E) => {
      map.current.set(entry.key, entry)
      sync()
      return () => {
        if (map.current.get(entry.key) !== entry) return
        map.current.delete(entry.key)
        sync()
      }
    },
    [sync],
  )
  return [entries, register]
}
