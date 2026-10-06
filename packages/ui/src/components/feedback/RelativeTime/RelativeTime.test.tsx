import { act, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { RelativeTime } from './RelativeTime'
import { formatRelativeTime } from './format'
import { must } from '#test/must'

const NOW = new Date('2026-06-24T10:00:00Z')

describe('formatRelativeTime', () => {
  const now = NOW.getTime()
  it.each([
    [now - 10_000, 'now'],
    [now - 3 * 60_000, '3 mins ago'],
    [now - 2 * 3600_000, '2 hrs ago'],
    [now - 86_400_000, 'yesterday'],
    [now + 5 * 60_000, 'in 5 mins'],
  ])('%s → %s', (at, expected) => {
    expect(formatRelativeTime(at, now, 'en-AU', 'short')).toBe(expected)
  })

  it('supports long wording', () => {
    expect(formatRelativeTime(now - 3 * 60_000, now, 'en-AU', 'long')).toBe('3 minutes ago')
  })
})

describe('RelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a <time> with an ISO dateTime and absolute title', () => {
    const ref = createRef<HTMLTimeElement>()
    const at = new Date(NOW.getTime() - 3 * 60_000)
    render(<RelativeTime ref={ref} date={at} />)
    const time = must(ref.current)
    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('datetime', at.toISOString())
    expect(time.getAttribute('title')).toMatch(/2026/)
    expect(time).toHaveTextContent('3 mins ago')
  })

  it('adds a prefix', () => {
    render(<RelativeTime date={NOW.getTime() - 60_000} prefix="Updated" />)
    expect(
      screen.getByText((_, el) => el?.tagName === 'TIME' && el.textContent === 'Updated 1 min ago'),
    ).toBeInTheDocument()
  })

  it('keeps the prefix out of the tabular time text', () => {
    render(<RelativeTime date={NOW.getTime() - 60_000} prefix="Updated" />)
    const value = screen.getByText('1 min ago')
    expect(value.tagName).toBe('SPAN')
    expect(value).not.toHaveTextContent('Updated')
    expect(screen.getByText('Updated', { exact: false, selector: 'span' })).not.toBe(value)
  })

  it('keeps itself current on an interval', () => {
    render(<RelativeTime date={NOW.toISOString()} updateInterval={60_000} />)
    const time = screen.getByText('now')
    act(() => {
      vi.advanceTimersByTime(5 * 60_000)
    })
    expect(time).toHaveTextContent('5 mins ago')
  })

  it('does not tick when updateInterval is 0', () => {
    render(<RelativeTime date={NOW} updateInterval={0} />)
    act(() => {
      vi.advanceTimersByTime(10 * 60_000)
    })
    expect(screen.getByText('now')).toBeInTheDocument()
  })

  it('says "just now" within the threshold, and Intl\'s wording outside it', () => {
    const { rerender } = render(<RelativeTime date={NOW.getTime() - 20_000} justNowWithin={60} />)
    expect(screen.getByText('just now')).toBeInTheDocument()
    rerender(<RelativeTime date={NOW.getTime() - 3 * 60_000} justNowWithin={60} />)
    expect(screen.getByText('3 mins ago')).toBeInTheDocument()
    rerender(<RelativeTime date={NOW.getTime() - 20_000} />)
    expect(screen.getByText('now')).toBeInTheDocument()
    rerender(
      <RelativeTime date={NOW.getTime() - 20_000} justNowWithin={60} justNowLabel="moments ago" />,
    )
    expect(screen.getByText('moments ago')).toBeInTheDocument()
  })
})
