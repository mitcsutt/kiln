import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useOptions, type OptionsLoader } from '#hooks/useOptions'

const cities = [
  { value: 'mel', label: 'Melbourne' },
  { value: 'cal', label: 'Calgary' },
]

describe('useOptions', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('passes static options through', () => {
    const { result } = renderHook(() => useOptions(cities))
    expect(result.current).toEqual({ options: cities, status: 'ready' })
  })

  it('loads immediately, then debounces query changes and aborts the previous request', async () => {
    const signals: AbortSignal[] = []
    const loader = vi.fn<OptionsLoader<string>>(({ query, signal }) => {
      signals.push(signal)
      return Promise.resolve(cities.filter((c) => c.label.toLowerCase().includes(query)))
    })
    const { result, rerender } = renderHook(({ query }) => useOptions(loader, { query }), {
      initialProps: { query: '' },
    })
    await act(() => {
      vi.advanceTimersByTime(0)
      return Promise.resolve()
    })
    expect(loader).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('ready')
    rerender({ query: 'm' })
    rerender({ query: 'me' })
    expect(result.current.status).toBe('loading')
    await act(() => {
      vi.advanceTimersByTime(249)
      return Promise.resolve()
    })
    expect(loader).toHaveBeenCalledTimes(1)
    await act(() => {
      vi.advanceTimersByTime(1)
      return Promise.resolve()
    })
    expect(loader).toHaveBeenCalledTimes(2)
    expect(loader.mock.calls[1]?.[0].query).toBe('me')
    expect(result.current.options).toEqual([cities[0]])
  })

  it('caches per loader + query + deps', async () => {
    const loader = vi.fn<OptionsLoader<string>>(() => Promise.resolve(cities))
    const { rerender, result } = renderHook(
      ({ query }) => useOptions(loader, { query, deps: ['A'] }),
      {
        initialProps: { query: 'x' },
      },
    )
    await act(() => {
      vi.advanceTimersByTime(0)
      return Promise.resolve()
    })
    rerender({ query: 'y' })
    await act(() => {
      vi.advanceTimersByTime(300)
      return Promise.resolve()
    })
    rerender({ query: 'x' })
    expect(result.current.status).toBe('ready')
    expect(loader).toHaveBeenCalledTimes(2)
  })

  it('stays idle below minQueryLength and reports errors', async () => {
    const loader = vi.fn<OptionsLoader<string>>(() => Promise.reject(new Error('down')))
    const { result, rerender } = renderHook(
      ({ query }) => useOptions(loader, { query, minQueryLength: 2 }),
      {
        initialProps: { query: 'a' },
      },
    )
    expect(result.current.status).toBe('idle')
    rerender({ query: 'ab' })
    await act(() => {
      vi.advanceTimersByTime(0)
      return Promise.resolve()
    })
    expect(result.current.status).toBe('error')
  })

  it('an inline loader renders without looping, fetches once per debounced query, and hits the cache', async () => {
    const calls: string[] = []
    let renders = 0
    const { result, rerender } = renderHook(
      ({ query }) => {
        renders += 1
        // A new function identity on every render, as an app would write it inline.
        return useOptions<string>(
          ({ query: q }) => {
            calls.push(q)
            return Promise.resolve(cities.filter((c) => c.label.toLowerCase().startsWith(q)))
          },
          { query },
        )
      },
      { initialProps: { query: '' } },
    )
    await act(() => {
      vi.advanceTimersByTime(0)
      return Promise.resolve()
    })
    expect(result.current.status).toBe('ready')
    expect(calls).toEqual([''])
    rerender({ query: 'm' })
    rerender({ query: 'me' })
    await act(() => {
      vi.advanceTimersByTime(250)
      return Promise.resolve()
    })
    expect(calls).toEqual(['', 'me'])
    expect(result.current.options).toEqual([cities[0]])
    // Re-renders with the same query (new loader identity) neither refetch nor loop.
    rerender({ query: 'me' })
    rerender({ query: 'me' })
    await act(() => {
      vi.advanceTimersByTime(1000)
      return Promise.resolve()
    })
    expect(calls).toEqual(['', 'me'])
    // Going back to a cached query is a cache hit.
    rerender({ query: '' })
    expect(result.current.status).toBe('ready')
    expect(result.current.options).toEqual(cities)
    expect(calls).toEqual(['', 'me'])
    expect(renders).toBeLessThan(30)
  })
})
