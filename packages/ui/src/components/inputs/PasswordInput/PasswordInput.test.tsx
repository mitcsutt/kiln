import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { PasswordInput } from './PasswordInput'

describe('PasswordInput', () => {
  it('renders a password input with autocomplete and forwards the ref', () => {
    const ref = createRef<HTMLInputElement>()
    render(<PasswordInput ref={ref} aria-label="Password" autoComplete="current-password" />)
    const input = screen.getByLabelText('Password')
    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveAttribute('autocomplete', 'current-password')
  })

  it('toggles visibility; the toggle name says what pressing does, without aria-pressed', async () => {
    const onVisibleChange = vi.fn()
    render(
      <PasswordInput
        aria-label="Password"
        autoComplete="new-password"
        onVisibleChange={onVisibleChange}
      />,
    )
    const input = screen.getByLabelText('Password')
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(toggle).not.toHaveAttribute('aria-pressed')
    expect(toggle).toHaveAttribute('aria-controls', input.id)
    expect(toggle.id).not.toBe(input.id)
    await userEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(onVisibleChange).toHaveBeenLastCalledWith(true)
    expect(screen.getByRole('button', { name: 'Hide password' })).toBe(toggle)
    await userEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('uses custom labels and is controlled by visible', async () => {
    const onVisibleChange = vi.fn()
    const { rerender } = render(
      <PasswordInput
        aria-label="PIN"
        autoComplete="current-password"
        visible={false}
        onVisibleChange={onVisibleChange}
        showLabel="Show PIN"
        hideLabel="Hide PIN"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Show PIN' }))
    expect(onVisibleChange).toHaveBeenCalledWith(true)
    expect(screen.getByLabelText('PIN')).toHaveAttribute('type', 'password')
    rerender(
      <PasswordInput
        aria-label="PIN"
        autoComplete="current-password"
        visible
        showLabel="Show PIN"
        hideLabel="Hide PIN"
      />,
    )
    expect(screen.getByLabelText('PIN')).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide PIN' })).toBeInTheDocument()
  })

  it('hides the password again when the form is submitted or reset', async () => {
    render(
      <form
        data-testid="form"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <PasswordInput
          aria-label="Password"
          autoComplete="current-password"
          name="password"
          defaultValue="hunter22"
          defaultVisible
        />
      </form>,
    )
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'text')
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).get('password')).toBe(
      'hunter22',
    )
    fireEvent.submit(screen.getByTestId('form'))
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    fireEvent.reset(screen.getByTestId('form'))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('fires onBlur only when focus leaves both the input and the toggle', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <PasswordInput aria-label="Password" autoComplete="current-password" onBlur={onBlur} />
        <button type="button">Sign in</button>
      </>,
    )
    await userEvent.click(screen.getByLabelText('Password'))
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveFocus()
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Sign in' })).toHaveFocus()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('keeps focus in the input when the toggle is clicked', async () => {
    render(<PasswordInput aria-label="Password" autoComplete="current-password" />)
    const input = screen.getByLabelText('Password')
    await userEvent.click(input)
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveFocus()
  })

  it('disables the toggle with the input; readOnly still lets you look', async () => {
    const { rerender } = render(
      <PasswordInput aria-label="Password" autoComplete="current-password" disabled />,
    )
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled()
    rerender(<PasswordInput aria-label="Password" autoComplete="current-password" readOnly />)
    expect(screen.getByLabelText('Password')).toHaveAttribute('readonly')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
  })
})
