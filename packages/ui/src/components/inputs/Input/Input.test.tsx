import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Input } from './Input'

describe('Input', () => {
  it('forwards the ref and native props to the input, className to the box', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <Input
        ref={ref}
        name="client"
        placeholder="Northwind Studio"
        className="custom"
        aria-label="Client"
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Client' })
    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute('name', 'client')
    expect(input).toHaveAttribute('placeholder', 'Northwind Studio')
    expect(input.parentElement).toHaveClass('custom')
  })

  it('exposes size, numeric and invalid as data attributes', () => {
    render(<Input aria-label="Amount" size="lg" numeric invalid />)
    const input = screen.getByRole('textbox')
    const box = input.parentElement
    expect(box).toHaveAttribute('data-size', 'lg')
    expect(box).toHaveAttribute('data-numeric')
    expect(box).toHaveAttribute('data-invalid')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('inputmode', 'decimal')
  })

  it('renders leading and trailing adornments, and clicking one focuses the input', async () => {
    render(<Input aria-label="Amount" leading="$" trailing="AUD" />)
    await userEvent.click(screen.getByText('AUD'))
    expect(screen.getByRole('textbox')).toHaveFocus()
    expect(screen.getByText('$')).toHaveAttribute('data-slot', 'leading')
  })

  it('works controlled and uncontrolled', async () => {
    const onChange = vi.fn()
    render(<Input aria-label="Client" defaultValue="Orchard " onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Co.')
    expect(input).toHaveValue('Orchard Co.')
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('marks disabled on the box and the input', () => {
    render(<Input aria-label="Client" disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input.parentElement).toHaveAttribute('data-disabled')
  })
})
