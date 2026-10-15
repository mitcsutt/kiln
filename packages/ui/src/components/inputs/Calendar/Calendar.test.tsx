import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { must } from '#test/must'
import type { DateRangeValue } from '#components/inputs/DateRangeField'
import { Calendar } from './Calendar'

const day = (name: string) => screen.getByRole('gridcell', { name })

describe('Calendar', () => {
  it('renders a grid labelled by its month, with weekday headers from the locale; ref → root', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Calendar ref={ref} aria-label="Delivery date" defaultValue="2026-10-15" />)
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Delivery date' }))
    const grid = screen.getByRole('grid', { name: 'October 2026' })
    const headers = within(grid).getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ])
    expect(must(headers[0])).toHaveAttribute('abbr', 'Monday')
    expect(within(grid).getAllByRole('row')).toHaveLength(7)
  })

  it('starts the week on Sunday in en-US, or wherever firstDayOfWeek says', () => {
    const { rerender } = render(<Calendar locale="en-US" defaultValue="2026-10-15" />)
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Sun')
    rerender(<Calendar locale="en-US" firstDayOfWeek={6} defaultValue="2026-10-15" />)
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Sat')
  })

  it('marks the selected day and today, with one tab stop on the selected day', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 20, 9))
    try {
      render(<Calendar defaultValue="2026-10-15" />)
      const selected = day('Thursday 15 October 2026')
      expect(selected).toHaveAttribute('aria-selected', 'true')
      expect(selected).toHaveAttribute('tabindex', '0')
      expect(day('Tuesday 20 October 2026')).toHaveAttribute('aria-current', 'date')
      expect(day('Tuesday 20 October 2026')).toHaveAttribute('tabindex', '-1')
      expect(screen.getAllByRole('gridcell').filter((c) => c.tabIndex === 0)).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('moves with the date-grid keys, turning the page past the month', async () => {
    const user = userEvent.setup()
    render(<Calendar defaultValue="2026-10-15" />)
    await user.click(day('Thursday 15 October 2026'))
    await user.keyboard('{ArrowRight}')
    expect(day('Friday 16 October 2026')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(day('Friday 23 October 2026')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(day('Monday 19 October 2026')).toHaveFocus()
    await user.keyboard('{End}')
    expect(day('Sunday 25 October 2026')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument()
    expect(day('Sunday 1 November 2026')).toHaveFocus()
    await user.keyboard('{PageUp}')
    expect(day('Thursday 1 October 2026')).toHaveFocus()
    await user.keyboard('{Shift>}{PageDown}{/Shift}')
    expect(day('Friday 1 October 2027')).toHaveFocus()
  })

  it('picks with Enter, Space or a click and reports YYYY-MM-DD', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Calendar defaultValue="2026-10-15" onValueChange={onValueChange} />)
    await user.click(day('Tuesday 6 October 2026'))
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-06')
    expect(day('Tuesday 6 October 2026')).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowRight}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-07')
    await user.keyboard('{ArrowRight} ')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-08')
  })

  it('turns pages with its buttons, carrying focus along', async () => {
    const user = userEvent.setup()
    const onMonthChange = vi.fn()
    render(<Calendar defaultValue="2026-10-15" onMonthChange={onMonthChange} />)
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument()
    expect(onMonthChange).toHaveBeenLastCalledWith('2026-11')
    expect(day('Sunday 15 November 2026')).toHaveAttribute('tabindex', '0')
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByRole('grid', { name: 'September 2026' })).toBeInTheDocument()
  })

  it('follows a controlled month', () => {
    function Controlled() {
      const [month, setMonth] = useState('2026-10')
      return (
        <>
          <Calendar month={month} onMonthChange={setMonth} />
          <button
            type="button"
            onClick={() => {
              setMonth('2027-03')
            }}
          >
            March
          </button>
        </>
      )
    }
    render(<Controlled />)
    fireEvent.click(screen.getByRole('button', { name: 'March' }))
    expect(screen.getByRole('grid', { name: 'March 2027' })).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell').filter((c) => c.tabIndex === 0)).toHaveLength(1)
  })

  it('keeps min, max and isDateDisabled days focusable but not pickable', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const weekend = (date: string) => [0, 6].includes(new Date(`${date}T12:00`).getDay())
    render(
      <Calendar
        defaultValue="2026-10-15"
        min="2026-10-05"
        max="2026-10-28"
        isDateDisabled={weekend}
        onValueChange={onValueChange}
      />,
    )
    expect(day('Sunday 4 October 2026')).toHaveAttribute('aria-disabled', 'true')
    expect(day('Thursday 29 October 2026')).toHaveAttribute('aria-disabled', 'true')
    const saturday = day('Saturday 17 October 2026')
    expect(saturday).toHaveAttribute('aria-disabled', 'true')
    await user.click(saturday)
    expect(saturday).toHaveFocus()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled()
    // Arrowing stops at the bounds instead of wandering into months it can't use.
    await user.click(day('Wednesday 28 October 2026'))
    await user.keyboard('{ArrowDown}')
    expect(day('Wednesday 28 October 2026')).toHaveFocus()
  })

  it('picks a range: start, then end, swapping a backwards pick', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Calendar mode="range" defaultMonth="2026-10" onValueChange={onValueChange} months={2} />,
    )
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument()
    await user.click(day('Tuesday 20 October 2026'))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-20', end: '' })
    await user.hover(day('Friday 23 October 2026'))
    expect(day('Wednesday 21 October 2026')).toHaveAttribute('data-preview')
    await user.click(day('Friday 16 October 2026'))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-16', end: '2026-10-20' })
    for (const name of ['Friday 16 October 2026', 'Sunday 18 October 2026']) {
      expect(day(name)).toHaveAttribute('aria-selected', 'true')
    }
    expect(day('Friday 16 October 2026')).toHaveAttribute('data-range-start')
    expect(day('Tuesday 20 October 2026')).toHaveAttribute('data-range-end')
    // A third pick starts again.
    await user.click(day('Monday 2 November 2026'))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-11-02', end: '' })
  })

  it('is a controlled range', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState<DateRangeValue>({ start: '2026-10-05', end: '' })
      return (
        <>
          <Calendar mode="range" value={value} onValueChange={setValue} />
          <output>{`${value.start}|${value.end}`}</output>
        </>
      )
    }
    render(<Controlled />)
    await user.click(day('Friday 9 October 2026'))
    expect(screen.getByRole('status')).toHaveTextContent('2026-10-05|2026-10-09')
  })

  it('readOnly reads but never picks; disabled takes every day out of the tab order', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Calendar defaultValue="2026-10-15" readOnly onValueChange={onValueChange} />,
    )
    await user.click(day('Friday 16 October 2026'))
    expect(day('Friday 16 October 2026')).toHaveFocus()
    expect(onValueChange).not.toHaveBeenCalled()
    rerender(<Calendar defaultValue="2026-10-15" disabled />)
    expect(screen.getAllByRole('gridcell').some((c) => c.hasAttribute('tabindex'))).toBe(false)
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled()
  })

  it('names months and days in the locale, and takes its own button labels', () => {
    render(
      <Calendar
        locale="de-DE"
        defaultValue="2026-10-15"
        labels={{ previousMonth: 'Vorheriger Monat', nextMonth: 'Nächster Monat' }}
      />,
    )
    expect(screen.getByRole('grid', { name: 'Oktober 2026' })).toBeInTheDocument()
    expect(day('Donnerstag, 15. Oktober 2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nächster Monat' })).toBeInTheDocument()
  })
})
