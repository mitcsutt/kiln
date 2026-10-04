import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { TextField } from './TextField'

describe('TextField', () => {
  it('renders a labelled input and forwards the ref to it', () => {
    const ref = createRef<HTMLInputElement>()
    render(<TextField ref={ref} label="Email" type="email" name="email" />)
    const input = screen.getByLabelText('Email')
    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('name', 'email')
  })

  it('uses the given id for the input (legacy prop)', () => {
    render(<TextField id="amount" label="Amount" />)
    expect(screen.getByLabelText('Amount')).toHaveAttribute('id', 'amount')
  })

  it('calls onValueChange with the string and native onChange with the event', async () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    render(<TextField label="Client" onValueChange={onValueChange} onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Client'), 'a')
    expect(onValueChange).toHaveBeenCalledWith('a')
    expect(onChange.mock.calls[0]?.[0]).toHaveProperty('target')
  })

  it('shows error as an alert and wires describedby, required mark, disabled', () => {
    render(
      <TextField
        label="Email"
        description="We only use it for receipts"
        error="Required"
        required
        disabled
      />,
    )
    const input = screen.getByLabelText(/Email/)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toBeRequired()
    expect(input).toHaveAccessibleDescription('We only use it for receipts Required')
    expect(input).toBeDisabled()
  })

  it('shows a character count linked by describedby, live only near the limit', async () => {
    render(<TextField label="Bio" maxLength={20} showCount defaultValue="12345678901234" />)
    const input = screen.getByLabelText('Bio')
    expect(screen.getByText('14 / 20')).toBeInTheDocument()
    expect(input).toHaveAccessibleDescription('14 / 20')
    expect(screen.getByText('14 / 20')).not.toHaveAttribute('aria-live')
    await userEvent.type(input, '123456')
    expect(screen.getByText('20 / 20')).toHaveAttribute('aria-live', 'polite')
  })

  it('passes adornments and numeric through, className to the wrapper', () => {
    const { container } = render(
      <TextField label="Amount" numeric leading="$" trailing="AUD" className="wrap" />,
    )
    expect(container.firstElementChild).toHaveClass('wrap')
    expect(screen.getByText('AUD')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toHaveAttribute('inputmode', 'decimal')
  })
})
