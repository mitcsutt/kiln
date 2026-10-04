import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { PasswordField } from './PasswordField'

describe('PasswordField', () => {
  it('labels the input, forwards the ref and wires description + error', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <PasswordField
        ref={ref}
        label="New password"
        autoComplete="new-password"
        description="At least 12 characters"
        error="Too short"
        required
      />,
    )
    const input = screen.getByLabelText(/New password/)
    expect(ref.current).toBe(input)
    expect(input).toHaveAccessibleDescription('At least 12 characters Too short')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toBeRequired()
  })

  it('calls onValueChange with the string and native onChange with the event', async () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    render(
      <PasswordField
        label="Password"
        autoComplete="current-password"
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    )
    await userEvent.type(screen.getByLabelText('Password'), 'ab')
    expect(onValueChange).toHaveBeenLastCalledWith('ab')
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('is controlled with value', async () => {
    function Controlled() {
      const [value, setValue] = useState('')
      return (
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={value}
          onValueChange={(v) => {
            setValue(v.slice(0, 4))
          }}
        />
      )
    }
    render(<Controlled />)
    await userEvent.type(screen.getByLabelText('Password'), 'abcdef')
    expect(screen.getByLabelText('Password')).toHaveValue('abcd')
  })

  it('uses the given id and passes readOnly/disabled', () => {
    const { rerender } = render(
      <PasswordField id="pw" label="Password" autoComplete="current-password" readOnly />,
    )
    expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'pw')
    expect(screen.getByLabelText('Password')).toHaveAttribute('readonly')
    rerender(<PasswordField id="pw" label="Password" autoComplete="current-password" disabled />)
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })
})
