import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { DateRangeField, type DateRangeValue } from './DateRangeField'

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
