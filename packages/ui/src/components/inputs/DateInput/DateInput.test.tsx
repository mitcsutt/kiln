import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { Field } from '#components/inputs/Field'
import { DateInput } from './DateInput'

const seg = (name: string) => screen.getByRole('spinbutton', { name })

describe('DateInput', () => {
  it('renders a labelled group of day, month and year parts in the locale order; ref → group', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Field label="Due date" description="Invoices are due within 30 days">
        <DateInput ref={ref} />
      </Field>,
    )
    const group = screen.getByRole('group', { name: 'Due date' })
    expect(ref.current).toBe(group)
    expect(group).toHaveAccessibleDescription('Invoices are due within 30 days')
    const parts = screen.getAllByRole('spinbutton').map((el) => el.getAttribute('aria-label'))
    expect(parts).toEqual(['Day', 'Month', 'Year'])
    expect(seg('Day')).toHaveAttribute('id', screen.getByText('Due date').getAttribute('for'))
  })

  it('follows the locale: month first in en-US', () => {
    render(<DateInput aria-label="Due date" locale="en-US" />)
    const parts = screen.getAllByRole('spinbutton').map((el) => el.getAttribute('aria-label'))
    expect(parts).toEqual(['Month', 'Day', 'Year'])
  })

  it('types digits part by part, moving on when a part is full, and reports the ISO date', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateInput aria-label="Due date" onValueChange={onValueChange} />)
    await user.click(seg('Day'))
    await user.keyboard('15')
    expect(seg('Month')).toHaveFocus()
    // "1" could still become 10–12, so it waits; "0" makes 10 and moves on.
    await user.keyboard('1')
    expect(seg('Month')).toHaveFocus()
    await user.keyboard('0')
    expect(seg('Year')).toHaveFocus()
    await user.keyboard('202')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard('6')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-15')
    expect(seg('Day')).toHaveAttribute('aria-valuenow', '15')
    expect(seg('Year')).toHaveTextContent('2026')
  })

  it('moves on at once when a digit cannot take another (4 → day 04)', async () => {
    const user = userEvent.setup()
    render(<DateInput aria-label="Due date" />)
    await user.click(seg('Day'))
    await user.keyboard('4')
    expect(seg('Day')).toHaveTextContent('04')
    expect(seg('Month')).toHaveFocus()
  })

  it('steps parts with the arrow keys, wrapping within the part', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateInput aria-label="Due date" defaultValue="2026-12-31" onValueChange={onValueChange} />,
    )
    await user.click(seg('Month'))
    await user.keyboard('{ArrowUp}')
    expect(seg('Month')).toHaveAttribute('aria-valuenow', '1')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-01-31')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    // February has no 31st: the day follows the month.
    expect(onValueChange).toHaveBeenLastCalledWith('2026-11-30')
    await user.keyboard('{ArrowLeft}')
    expect(seg('Day')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-11-01')
  })

  it('starts an empty part from today on an arrow key', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 15, 12))
    try {
      render(<DateInput aria-label="Due date" />)
      act(() => {
        seg('Year').focus()
      })
      fireEvent.keyDown(seg('Year'), { key: 'ArrowUp' })
      expect(seg('Year')).toHaveAttribute('aria-valuenow', '2026')
    } finally {
      vi.useRealTimers()
    }
  })

  it('clears a part with Backspace, empties the value, then steps back', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateInput aria-label="Due date" defaultValue="2026-10-15" onValueChange={onValueChange} />,
    )
    await user.click(seg('Month'))
    await user.keyboard('{Backspace}')
    expect(seg('Month')).toHaveAttribute('aria-valuetext', 'Empty')
    expect(onValueChange).toHaveBeenLastCalledWith('')
    await user.keyboard('{Backspace}')
    expect(seg('Day')).toHaveFocus()
  })

  it('pastes a whole date into any part', () => {
    const onValueChange = vi.fn()
    render(<DateInput aria-label="Due date" onValueChange={onValueChange} />)
    fireEvent.paste(seg('Day'), { clipboardData: { getData: () => '2026-11-03' } })
    expect(onValueChange).toHaveBeenLastCalledWith('2026-11-03')
    fireEvent.paste(seg('Day'), { clipboardData: { getData: () => '24/12/2026' } })
    expect(onValueChange).toHaveBeenLastCalledWith('2026-12-24')
  })

  it('is controlled: a new value resets the parts', () => {
    function Controlled() {
      const [value, setValue] = useState('2026-10-15')
      return (
        <>
          <DateInput aria-label="Due date" value={value} onValueChange={setValue} />
          <button
            type="button"
            onClick={() => {
              setValue('2027-01-04')
            }}
          >
            Next year
          </button>
        </>
      )
    }
    render(<Controlled />)
    fireEvent.click(screen.getByRole('button', { name: 'Next year' }))
    expect(seg('Day')).toHaveTextContent('04')
    expect(seg('Year')).toHaveTextContent('2027')
  })

  it('opens a calendar on its button and on Alt+Down, and a pick fills the date and closes', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateInput aria-label="Due date" defaultValue="2026-10-15" onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    const dialog = await screen.findByRole('dialog', { name: 'Choose date' })
    expect(screen.getByRole('gridcell', { name: 'Thursday 15 October 2026' })).toHaveFocus()
    expect(dialog).toBeInTheDocument()
    await user.keyboard('{ArrowRight}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-16')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(seg('Day')).toHaveTextContent('16')
    await user.click(seg('Day'))
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('marks a date outside min/max invalid and disables those days', async () => {
    const user = userEvent.setup()
    render(
      <DateInput
        aria-label="Due date"
        defaultValue="2026-09-30"
        min="2026-10-01"
        max="2026-10-31"
      />,
    )
    expect(seg('Day')).toHaveAttribute('aria-invalid', 'true')
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    // The calendar opens on the nearest date it allows, and can't page back before it.
    expect(await screen.findByRole('gridcell', { name: 'Thursday 1 October 2026' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled()
  })

  it('clears with the clear button and submits the ISO date under name', async () => {
    const user = userEvent.setup()
    render(
      <form data-testid="form">
        <DateInput aria-label="Due date" name="due" defaultValue="2026-10-15" clearable />
      </form>,
    )
    const form = screen.getByTestId<HTMLFormElement>('form')
    expect(new FormData(form).get('due')).toBe('2026-10-15')
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(new FormData(form).get('due')).toBe('')
    expect(seg('Day')).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })

  it('takes disabled, readOnly, required and invalid from a Field', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Field label="Due date" required error="Choose a due date">
        <DateInput onValueChange={onValueChange} />
      </Field>,
    )
    expect(seg('Day')).toHaveAttribute('aria-required', 'true')
    expect(seg('Day')).toHaveAttribute('aria-invalid', 'true')
    rerender(
      <Field label="Due date" readOnly>
        <DateInput defaultValue="2026-10-15" onValueChange={onValueChange} />
      </Field>,
    )
    await user.click(seg('Day'))
    await user.keyboard('{ArrowUp}3')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(seg('Day')).toHaveAttribute('aria-readonly', 'true')
    expect(screen.getByRole('button', { name: 'Choose date' })).toBeDisabled()
    rerender(
      <Field label="Due date" disabled>
        <DateInput defaultValue="2026-10-15" />
      </Field>,
    )
    expect(seg('Day')).not.toHaveAttribute('tabindex')
    expect(seg('Day')).toHaveAttribute('aria-disabled', 'true')
  })

  it('fires onBlur once focus leaves the whole control, not between parts', async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(
      <>
        <DateInput aria-label="Due date" onBlur={onBlur} />
        <button type="button">After</button>
      </>,
    )
    await user.click(seg('Day'))
    await user.tab()
    expect(seg('Month')).toHaveFocus()
    expect(onBlur).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'After' }))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
