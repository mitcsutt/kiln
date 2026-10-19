import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'

import { TimeSeries } from '#index'

const MONTHS = [
  { month: '2026-01-01', revenue: 18200 },
  { month: '2026-02-01', revenue: 21400 },
  { month: '2026-03-01', revenue: 19800 },
]

describe('hydration', () => {
  it('hydrates the server frame without a mismatch, then draws into the same space', async () => {
    const chart = <TimeSeries data={MONTHS} x="month" label="Revenue" height={260} locale="en-AU" />
    const container = document.createElement('div')
    container.innerHTML = renderToString(chart)
    document.body.append(container)
    const figure = container.querySelector('figure')
    const before = figure?.getAttribute('style')
    const errors: unknown[] = []
    const root = await act(() =>
      hydrateRoot(container, chart, {
        onRecoverableError: (error) => {
          errors.push(error)
        },
      }),
    )
    expect(errors).toEqual([])
    // The same element, at the same reserved height, now with the plot drawn inside it.
    expect(container.querySelector('figure')).toBe(figure)
    expect(figure?.getAttribute('style')).toBe(before)
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull()
    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
