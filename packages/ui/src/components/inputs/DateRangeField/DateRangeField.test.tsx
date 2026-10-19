import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { DateRangeField, type DateRangeValue } from './DateRangeField'
import { DateRangePickerField } from './DateRangePickerField'

describe('DateRangeField', () => {
  it('renders a fieldset with legend = label and two labelled date inputs; ref → fieldset', () => {
    const ref = createRef<HTMLFieldSetElement>()
    render(<DateRangeField ref={ref} label="Trip dates" description="Flights not included" />)
    const group = screen.getByRole('group', { name: 'Trip dates' })
    expect(ref.current).toBe(group)
    expect(group).toHaveAccessibleDescription('Flights not included')
    expect(screen.getByLabelText('Start date')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('End date')).toHaveAttribute('type', 'date')
  })

  it('uses custom part labels and gives id to the start input', () => {
    render(<DateRangeField id="trip" label="Lease" startLabel="Moving in" endLabel="Moving out" />)
    expect(screen.getByLabelText('Moving in')).toHaveAttribute('id', 'trip')
    expect(screen.getByLabelText('Moving out')).toBeInTheDocument()
  })

  it('is uncontrolled and reports the whole range', () => {
    const onValueChange = vi.fn()
    render(
      <DateRangeField
        label="Trip dates"
        defaultValue={{ start: '2026-11-02', end: '' }}
        onValueChange={onValueChange}
      />,
    )
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-11-09' } })
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-11-02', end: '2026-11-09' })
    expect(screen.getByLabelText('End date')).toHaveValue('2026-11-09')
  })

  it('is controlled', () => {
    function Controlled() {
      const [value, setValue] = useState<DateRangeValue>({ start: '', end: '' })
      return (
        <>
          <DateRangeField label="Trip dates" value={value} onValueChange={setValue} />
          <output>{`${value.start}|${value.end}`}</output>
        </>
      )
    }
    render(<Controlled />)
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-12-20' } })
    expect(screen.getByRole('status')).toHaveTextContent('2026-12-20|')
  })

  it('links each end to the other with min/max inside the overall bounds', () => {
    const { rerender } = render(
      <DateRangeField label="Trip dates" min="2026-01-01" max="2026-12-31" />,
    )
    expect(screen.getByLabelText('Start date')).toHaveAttribute('min', '2026-01-01')
    expect(screen.getByLabelText('Start date')).toHaveAttribute('max', '2026-12-31')
    expect(screen.getByLabelText('End date')).toHaveAttribute('min', '2026-01-01')
    rerender(
      <DateRangeField
        label="Trip dates"
        min="2026-01-01"
        max="2026-12-31"
        value={{ start: '2026-03-01', end: '2026-03-10' }}
      />,
    )
    expect(screen.getByLabelText('Start date')).toHaveAttribute('max', '2026-03-10')
    expect(screen.getByLabelText('End date')).toHaveAttribute('min', '2026-03-01')
    expect(screen.getByLabelText('End date')).toHaveAttribute('max', '2026-12-31')
  })

  it('submits name.start and name.end', () => {
    render(
      <form data-testid="form">
        <DateRangeField
          label="Trip dates"
          name="trip"
          defaultValue={{ start: '2026-11-02', end: '2026-11-09' }}
        />
      </form>,
    )
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'))
    expect(data.get('trip.start')).toBe('2026-11-02')
    expect(data.get('trip.end')).toBe('2026-11-09')
  })

  it('submits nothing when disabled', () => {
    render(
      <form data-testid="form">
        <DateRangeField
          label="Trip dates"
          name="trip"
          defaultValue={{ start: '2026-11-02', end: '2026-11-09' }}
          disabled
        />
      </form>,
    )
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'))
    expect(data.getAll('trip.start')).toEqual([])
    expect(data.getAll('trip.end')).toEqual([])
  })

  it('marks both inputs invalid and required, error on the group', () => {
    render(<DateRangeField label="Trip dates" error="The trip ends before it starts" required />)
    expect(screen.getByLabelText('Start date')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('End date')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('End date')).toBeRequired()
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByRole('group', { name: /Trip dates/ })).toHaveAccessibleDescription(
      'The trip ends before it starts',
    )
  })

  it('readOnly ignores changes; disabled disables both', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <DateRangeField label="Trip dates" readOnly onValueChange={onValueChange} />,
    )
    expect(screen.getByLabelText('Start date')).toHaveAttribute('readonly')
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-11-02' } })
    expect(onValueChange).not.toHaveBeenCalled()
    rerender(<DateRangeField label="Trip dates" disabled />)
    expect(screen.getByLabelText('Start date')).toBeDisabled()
    expect(screen.getByLabelText('End date')).toBeDisabled()
  })

  it('fires onBlur only when focus leaves both inputs', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <DateRangeField label="Trip dates" onBlur={onBlur} />
        <button type="button">Search</button>
      </>,
    )
    await userEvent.click(screen.getByLabelText('Start date'))
    await userEvent.tab()
    expect(screen.getByLabelText('End date')).toHaveFocus()
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('passes layout to the fieldset', () => {
    render(<DateRangeField label="Trip dates" layout="horizontal" />)
    expect(screen.getByRole('group', { name: 'Trip dates' })).toHaveAttribute(
      'data-layout',
      'horizontal',
    )
  })
})

describe('DateRangePickerField', () => {
  const seg = (name: string, index = 0) =>
    screen.getAllByRole('spinbutton', { name })[index] as HTMLElement

  it('types each end part by part under the same legend and labels', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePickerField
        id="stay"
        label="Stay"
        startLabel="Check in"
        endLabel="Check out"
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('group', { name: 'Check in' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Check out' })).toBeInTheDocument()
    expect(seg('Day')).toHaveAttribute('id', 'stay')
    await user.click(seg('Day'))
    await user.keyboard('02112026')
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-11-02', end: '' })
  })

  it('picks the range in a two-month calendar and closes once both ends are set', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePickerField
        label="Stay"
        defaultValue={{ start: '2026-11-02', end: '' }}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getAllByRole('grid')).toHaveLength(2)
    await user.click(within(dialog).getByRole('gridcell', { name: 'Monday 9 November 2026' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-11-02', end: '2026-11-09' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(seg('Day', 1)).toHaveTextContent('09')
  })

  it('offers presets, works out function presets when picked, and marks the current one', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    let weekEnd = '2026-10-17'
    const thisWeek = vi.fn(() => ({ start: '2026-10-12', end: weekEnd }))
    render(
      <DateRangePickerField
        label="Report period"
        defaultValue={{ start: '2026-10-01', end: '2026-10-31' }}
        presets={[
          { label: 'October', value: { start: '2026-10-01', end: '2026-10-31' } },
          { label: 'This week', value: thisWeek },
        ]}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    const presets = await screen.findByRole('group', { name: 'Presets' })
    expect(within(presets).getByRole('button', { name: 'October' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    weekEnd = '2026-10-18'
    await user.click(within(presets).getByRole('button', { name: 'This week' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-12', end: '2026-10-18' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('adds a time to each end; a new range runs from the first day’s start to the last day’s end', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePickerField
        label="Incident window"
        granularity="minute"
        hourCycle={24}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getAllByRole('spinbutton', { name: 'Hour' })).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    const dialog = await screen.findByRole('dialog')
    const cells = within(dialog).getAllByRole('gridcell', { name: /\d{4}$/ })
    await user.click(cells[2] as HTMLElement)
    await user.click(cells[4] as HTMLElement)
    const last = onValueChange.mock.lastCall?.[0] as DateRangeValue
    expect(last.start).toMatch(/T00:00$/)
    expect(last.end).toMatch(/T23:59$/)
    // The panel stays open for the times.
    const endTime = within(dialog).getByRole('group', { name: 'End time' })
    await user.click(within(endTime).getByRole('spinbutton', { name: 'Hour' }))
    await user.keyboard('18')
    expect((onValueChange.mock.lastCall?.[0] as DateRangeValue).end).toMatch(/T18:59$/)
  })

  it('with a time, runs a date-only preset from its first day’s start to its last day’s end', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePickerField
        label="Incident window"
        granularity="minute"
        hourCycle={24}
        timeZone="Australia/Sydney"
        presets={[
          { label: 'Last 7 days', value: { start: '2026-10-08', end: '2026-10-15' } },
          {
            label: 'Morning shift',
            value: { start: '2026-10-15T06:00:00Z', end: '2026-10-15T09:30:00Z' },
          },
        ]}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    let presets = await screen.findByRole('group', { name: 'Presets' })
    await user.click(within(presets).getByRole('button', { name: 'Last 7 days' }))
    expect(onValueChange).toHaveBeenLastCalledWith({
      start: '2026-10-07T13:00:00Z',
      end: '2026-10-15T12:59:59Z',
    })
    expect(seg('Hour')).toHaveTextContent('00')
    expect(seg('Hour', 1)).toHaveTextContent('23')
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    presets = await screen.findByRole('group', { name: 'Presets' })
    expect(within(presets).getByRole('button', { name: 'Last 7 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(within(presets).getByRole('button', { name: 'Morning shift' }))
    expect(onValueChange).toHaveBeenLastCalledWith({
      start: '2026-10-15T06:00:00Z',
      end: '2026-10-15T09:30:00Z',
    })
  })

  it('keeps the start before the end while typing', () => {
    render(
      <DateRangePickerField
        label="Stay"
        defaultValue={{ start: '2026-11-12', end: '2026-11-09' }}
      />,
    )
    expect(seg('Day')).toHaveAttribute('aria-invalid', 'true')
  })

  it('fires onBlur only once focus leaves both ends and the calendar', async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(
      <>
        <DateRangePickerField label="Stay" onBlur={onBlur} />
        <button type="button">After</button>
      </>,
    )
    await user.click(seg('Day'))
    await user.click(seg('Day', 1))
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    await screen.findByRole('dialog')
    expect(onBlur).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'After' }))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('submits name.start and name.end', () => {
    render(
      <form data-testid="form">
        <DateRangePickerField
          label="Stay"
          name="stay"

          defaultValue={{ start: '2026-11-02', end: '2026-11-09' }}
        />
      </form>,
    )
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'))
    expect(data.get('stay.start')).toBe('2026-11-02')
    expect(data.get('stay.end')).toBe('2026-11-09')
  })
})
