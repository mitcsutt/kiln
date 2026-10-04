import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { NumberField } from './NumberField'

describe('NumberField', () => {
  it('labels the spinbutton, forwards the ref and wires description + error', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <NumberField
        ref={ref}
        label="Guests"
        description="Including you"
        error="Up to 12 guests"
        locale="en-US"
        max={12}
        required
      />,
    )
    const input = screen.getByRole('spinbutton', { name: /Guests/ })
    expect(ref.current).toBe(input)
    expect(input).toHaveAccessibleDescription('Including you Up to 12 guests')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Up to 12 guests')
  })

  it('uses the given id, merges aria-describedby, and points the steppers at the input', () => {
    render(
      <>
        <p id="note">Seats at the long table</p>
        <NumberField
          id="guests"
          label="Guests"
          aria-describedby="note"
          description="Including you"
        />
      </>,
    )
    const input = screen.getByLabelText('Guests')
    expect(input).toHaveAttribute('id', 'guests')
    expect(input).toHaveAccessibleDescription('Including you Seats at the long table')
    expect(screen.getByRole('button', { name: 'Increase' })).toHaveAttribute(
      'aria-controls',
      'guests',
    )
  })

  it('is uncontrolled with defaultValue and reports changes', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberField label="Guests" locale="en-US" defaultValue={2} onValueChange={onValueChange} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }))
    expect(onValueChange).toHaveBeenCalledWith(3)
    expect(screen.getByLabelText('Guests')).toHaveAttribute('aria-valuenow', '3')
  })

  it('passes readOnly and disabled to the input; className to the wrapper', () => {
    const { container, rerender } = render(<NumberField label="Guests" readOnly className="wrap" />)
    expect(container.firstElementChild).toHaveClass('wrap')
    expect(screen.getByLabelText('Guests')).toHaveAttribute('readonly')
    rerender(<NumberField label="Guests" disabled className="wrap" />)
    expect(screen.getByLabelText('Guests')).toBeDisabled()
  })

  it('fires onBlur when focus leaves the input', async () => {
    const onBlur = vi.fn()
    render(<NumberField label="Guests" onBlur={onBlur} />)
    await userEvent.click(screen.getByLabelText('Guests'))
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
