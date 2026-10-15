import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { DateTimeField } from '#components/inputs/DateTimeField'
import { DateTimeInput } from './DateTimeInput'

const seg = (name: string) => screen.getAllByRole('spinbutton', { name })[0] as HTMLElement

describe('DateTimeInput', () => {
  it('shows the date then the time in the locale order; ref → group', () => {
    const ref = createRef<HTMLDivElement>()
    render(<DateTimeInput ref={ref} aria-label="Starts" hourCycle={24} />)
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Starts' }))
    expect(screen.getAllByRole('spinbutton').map((el) => el.getAttribute('aria-label'))).toEqual([
      'Day',
      'Month',
      'Year',
      'Hour',
      'Minute',
    ])
  })

  it('types a wall-clock date-time and reports YYYY-MM-DDTHH:mm', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateTimeInput aria-label="Starts" hourCycle={24} onValueChange={onValueChange} />)
    await user.click(seg('Day'))
    await user.keyboard('1510202614')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard('30')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-15T14:30')
  })

  it('with timeZone, types the zone clock, reports UTC and shows the zone', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateTimeInput
        aria-label="Starts"
        hourCycle={24}
        timeZone="Australia/Sydney"
        defaultValue="2026-10-15T03:30:00Z"
        onValueChange={onValueChange}
      />,
    )
    expect(seg('Hour')).toHaveTextContent('14')
    expect(screen.getByText('AEDT')).toBeInTheDocument()
    await user.click(seg('Hour'))
    await user.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-15T04:30:00Z')
  })

  it('with timeZone, moves a wall time the clocks skip to the instant it reports', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateTimeInput
        aria-label="Starts"
        hourCycle={24}
        timeZone="Australia/Sydney"
        onValueChange={onValueChange}
      />,
    )
    await user.click(seg('Day'))
    await user.keyboard('041020260230')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-03T16:30:00Z')
    expect(seg('Hour')).toHaveTextContent('03')
    expect(seg('Minute')).toHaveTextContent('30')
  })

  it('picks a day in the calendar, keeping the time, and sets the time beneath it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateTimeField
        label="Starts"
        hourCycle={24}
        defaultValue="2026-10-15T09:15"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    const dialog = await screen.findByRole('dialog', { name: 'Choose date' })
    await user.click(within(dialog).getByRole('gridcell', { name: 'Tuesday 20 October 2026' }))
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-20T09:15')
    // The panel stays open so the time can be set too; its time box is its own control.
    const time = within(dialog).getByRole('group', { name: 'Time' })
    await user.click(within(time).getByRole('spinbutton', { name: 'Hour' }))
    await user.keyboard('17')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-20T17:15')
    expect(seg('Hour')).toHaveTextContent('17')
  })

  it('starts a new date at midnight when there is no time yet', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateTimeInput
        aria-label="Starts"
        hourCycle={24}
        defaultOpen
        onValueChange={onValueChange}
      />,
    )
    const cell = (await screen.findAllByRole('gridcell')).find((c) => c.tabIndex === 0)
    await user.click(cell as HTMLElement)
    expect(onValueChange).toHaveBeenLastCalledWith(expect.stringMatching(/T00:00$/))
  })

  it('marks a value before min invalid, comparing instants', () => {
    render(
      <DateTimeInput
        aria-label="Starts"
        timeZone="UTC"
        min="2026-10-15T09:00:00Z"
        defaultValue="2026-10-15T08:59:00Z"
      />,
    )
    expect(seg('Day')).toHaveAttribute('aria-invalid', 'true')
  })

  it('submits the value under name', () => {
    render(
      <form data-testid="form">
        <DateTimeInput aria-label="Starts" name="starts" defaultValue="2026-10-15T09:15" />
      </form>,
    )
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).get('starts')).toBe(
      '2026-10-15T09:15',
    )
  })
})
