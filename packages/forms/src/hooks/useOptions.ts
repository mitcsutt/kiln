import { useEffect, useRef, useState } from 'react'
import type { FieldOption, Primitive } from '#kit/contracts'

/** Loads options for a query (§7.4). Honour `signal` — superseded requests are aborted. */
export type OptionsLoader<V extends Primitive = Primitive> = (ctx: {
  query: string
  values: unknown
  signal: AbortSignal
}) => Promise<readonly FieldOption<V>[]>

export interface UseOptionsOptions {
  /** The current search text. Default `''`. */
  query?: string
  /** Reload (and cache separately) when these change — e.g. the values of `reloadOn` fields. */
  deps?: readonly unknown[]
  /** Passed to the loader as `values` (form values for dependent options). */
  values?: unknown
  /** Default 250. The first load is not debounced. */
  debounceMs?: number
  /** Below this many characters nothing loads (`status: 'idle'`). Default 0. */
  minQueryLength?: number
}

export type OptionsStatus = 'idle' | 'loading' | 'error' | 'ready'

export interface UseOptionsResult<V extends Primitive = Primitive> {
  options: readonly FieldOption<V>[]
  status: OptionsStatus
  error?: unknown
}

const CACHE_SIZE = 50

type Cache = Map<string, readonly FieldOption[]>

function remember(cache: Cache, key: string, options: readonly FieldOption[]): void {
  cache.delete(key)
  cache.set(key, options)
  while (cache.size > CACHE_SIZE) {
    const oldest = cache.keys().next()
    if (oldest.done) break
    cache.delete(oldest.value)
  }
}

function recall(cache: Cache, key: string): readonly FieldOption[] | undefined {
  const hit = cache.get(key)
  if (hit) {
    // refresh recency
    cache.delete(key)
    cache.set(key, hit)
  }
  return hit
}

const EMPTY: readonly FieldOption[] = []

function isAbort(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'AbortError'
  )
}

/**
 * Options from a loader, debounced, cached and cancelled when superseded. The hook behind async
 * comboboxes.
 *
 * @remarks
 * `useOptions(source, options)` turns a loader into options for a list: it debounces the query,
 * aborts the previous request when a new one starts, and caches recent results (50 entries, keyed
 * by the query and its dependencies). Static options pass straight through. The bound combobox and
 * multi-select fields use it for `loadOptions`; use it directly for your own controls.
 *
 * @privateRemarks
 * Static options pass through; a loader is debounced, aborts the previous request and caches
 * results (LRU, 50 entries, key = query + JSON of deps). The loader is read through a ref, so an
 * inline loader (new identity every render) neither refetches nor loops; change `deps` to reload.
 */
export function useOptions<V extends Primitive = Primitive>(
  source: OptionsLoader<V> | readonly FieldOption<V>[],
  opts: UseOptionsOptions = {},
): UseOptionsResult<V> {
  const { query = '', deps, values, debounceMs = 250, minQueryLength = 0 } = opts
  const loader = typeof source === 'function' ? source : null
  const key = `${query}\u0000${JSON.stringify(deps ?? [])}`
  const [state, setState] = useState<{ key: string; result: UseOptionsResult<V> }>(() => ({
    key: '',
    result: { options: EMPTY as readonly FieldOption<V>[], status: 'idle' },
  }))
  const valuesRef = useRef(values)
  const loaderRef = useRef(loader)
  const firstRef = useRef(true)
  const [cache] = useState<Cache>(() => new Map())
  const isLoader = loader !== null

  useEffect(() => {
    valuesRef.current = values
    loaderRef.current = loader
  })

  useEffect(() => {
    if (!isLoader) return undefined
    if (query.length < minQueryLength) {
      // The effect owns the loader state: a query that got too short resets it to idle.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ key, result: { options: EMPTY as readonly FieldOption<V>[], status: 'idle' } })
      return undefined
    }
    const cached = recall(cache, key)
    if (cached) {
      setState({ key, result: { options: cached as readonly FieldOption<V>[], status: 'ready' } })
      return undefined
    }
    const controller = new AbortController()
    const delay = firstRef.current ? 0 : debounceMs
    firstRef.current = false
    setState((prev) => ({ key, result: { options: prev.result.options, status: 'loading' } }))
    const timer = setTimeout(() => {
      const load = loaderRef.current
      if (!load) return
      load({ query, values: valuesRef.current, signal: controller.signal }).then(
        (options) => {
          if (controller.signal.aborted) return
          remember(cache, key, options)
          setState({ key, result: { options, status: 'ready' } })
        },
        (error: unknown) => {
          if (controller.signal.aborted || isAbort(error)) return
          setState((prev) => ({
            key,
            result: { options: prev.result.options, status: 'error', error },
          }))
        },
      )
    }, delay)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [isLoader, cache, key, query, minQueryLength, debounceMs])

  if (!loader) return { options: source as readonly FieldOption<V>[], status: 'ready' }
  return state.result
}
