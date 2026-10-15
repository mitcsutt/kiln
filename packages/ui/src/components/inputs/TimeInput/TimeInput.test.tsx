import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Field } from '#components/inputs/Field'
import { TimeInput } from './TimeInput'

const seg = (name: string) => screen.getByRole('spinbutton', { name })

describe('TimeInput', () => {
  it('renders a labelled group of hour and minute parts; ref → group', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Field label="Opens at">
        <TimeInput ref={ref} hourCycle={24} />
      </Field>,
    )
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Opens at' }))
    expect(screen.getAllByRole('spinbutton').map((el) => el.getAttribute('aria-label'))).toEqual([
      'Hour',
      'Minute',
    ])
  })

  it('adds seconds with granularity="second" and am/pm on a 12-hour clock', () => {
    render(<TimeInput aria-label="Started" granularity="second" hourCycle={12} locale="en-US" />)
    expect(screen.getAllByRole('spinbutton').map((el) => el.getAttribute('aria-label'))).toEqual([
      'Hour',
      'Minute',
      'Second',
      'AM/PM',
    ])
  })

  it('follows the locale clock unless hourCycle says otherwise', () => {
    const { rerender } = render(<TimeInput aria-label="Opens at" locale="en-US" />)
    expect(seg('AM/PM')).toBeInTheDocument()
    rerender(<TimeInput aria-label="Opens at" locale="en-GB" />)
    expect(screen.queryByRole('spinbutton', { name: 'AM/PM' })).not.toBeInTheDocument()
  })

  it('types a 24-hour time and reports HH:mm', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimeInput aria-label="Opens at" hourCycle={24} onValueChange={onValueChange} />)
    await user.click(seg('Hour'))
    // "2" could still be 20–23; "5" can't follow it, so the hour becomes 5 and moves on.
    await user.keyboard('2')
    expect(seg('Hour')).toHaveFocus()
    await user.keyboard('3')
    expect(seg('Minute')).toHaveFocus()
    await user.keyboard('07')
    expect(onValueChange).toHaveBeenLastCalledWith('23:07')
  })

  it('keeps the value on the 24-hour clock while showing 12 hours, and types p for pm', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TimeInput
        aria-label="Opens at"
        hourCycle={12}
        locale="en-US"
        onValueChange={onValueChange}
      />,
    )
    await user.click(seg('Hour'))
    await user.keyboard('230')
    expect(onValueChange).toHaveBeenLastCalledWith('02:30')
    expect(seg('AM/PM')).toHaveFocus()
    await user.keyboard('p')
    expect(onValueChange).toHaveBeenLastCalledWith('14:30')
    expect(seg('AM/PM')).toHaveTextContent('PM')
    expect(seg('Hour')).toHaveAttribute('aria-valuenow', '2')
    await user.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith('02:30')
  })

  it('wraps minutes with the arrow keys and pages by ten', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TimeInput
        aria-label="Opens at"
        hourCycle={24}
        defaultValue="09:55"
        onValueChange={onValueChange}
      />,
    )
    await user.click(seg('Minute'))
    await user.keyboard('{PageUp}')
    expect(onValueChange).toHaveBeenLastCalledWith('09:05')
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')
    expect(onValueChange).toHaveBeenLastCalledWith('09:59')
  })

  it('waits for seconds before reporting a second-granularity time', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TimeInput
        aria-label="Started"
        hourCycle={24}
        granularity="second"
        onValueChange={onValueChange}
      />,
    )
    await user.click(seg('Hour'))
    await user.keyboard('1430')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard('05')
    expect(onValueChange).toHaveBeenLastCalledWith('14:30:05')
  })

  it('pastes a time and marks one outside min/max invalid', () => {
    const onValueChange = vi.fn()
    render(
      <TimeInput
        aria-label="Opens at"
        hourCycle={24}
        min="07:00"
        max="22:00"
        onValueChange={onValueChange}
      />,
    )
    fireEvent.paste(seg('Hour'), { clipboardData: { getData: () => '06:45' } })
    expect(onValueChange).toHaveBeenLastCalledWith('06:45')
    expect(seg('Hour')).toHaveAttribute('aria-invalid', 'true')
  })

  it('clears and submits under name', async () => {
    const user = userEvent.setup()
    render(
      <form data-testid="form">
        <TimeInput aria-label="Opens at" name="opens" defaultValue="08:30" clearable />
      </form>,
    )
    const form = screen.getByTestId<HTMLFormElement>('form')
    expect(new FormData(form).get('opens')).toBe('08:30')
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(new FormData(form).get('opens')).toBe('')
  })
})
