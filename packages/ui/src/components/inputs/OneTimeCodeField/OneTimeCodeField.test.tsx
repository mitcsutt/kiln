import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { OneTimeCodeField } from './OneTimeCodeField'
import { must } from '#test/must'

describe('OneTimeCodeField', () => {
  it('names the group with the label and describes it; ref goes to the group', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <OneTimeCodeField
        ref={ref}
        label="Verification code"
        description="Sent to 0412 345 678"
        error="That code has expired"
      />,
    )
    const group = screen.getByRole('group', { name: 'Verification code' })
    expect(ref.current).toBe(group)
    expect(group).toHaveAccessibleDescription('Sent to 0412 345 678 That code has expired')
    expect(screen.getAllByRole('textbox')[0]).toHaveAttribute('aria-invalid', 'true')
  })

  it('clicking the label focuses the first cell, which takes the id', async () => {
    render(<OneTimeCodeField id="otp" label="Verification code" />)
    const first = screen.getAllByRole('textbox')[0]
    expect(first).toHaveAttribute('id', 'otp')
    await userEvent.click(screen.getByText('Verification code'))
    expect(first).toHaveFocus()
  })

  it('reports value and completion', async () => {
    const onValueChange = vi.fn()
    const onComplete = vi.fn()
    render(
      <OneTimeCodeField
        label="Code"
        length={4}
        onValueChange={onValueChange}
        onComplete={onComplete}
      />,
    )
    await userEvent.click(must(screen.getAllByRole('textbox')[0]))
    await userEvent.keyboard('2468')
    expect(onValueChange).toHaveBeenLastCalledWith('2468')
    expect(onComplete).toHaveBeenCalledWith('2468')
  })

  it('passes disabled and readOnly through', () => {
    const { rerender } = render(<OneTimeCodeField label="Code" disabled />)
    for (const cell of screen.getAllByRole('textbox')) expect(cell).toBeDisabled()
    rerender(<OneTimeCodeField label="Code" readOnly />)
    for (const cell of screen.getAllByRole('textbox')) expect(cell).toHaveAttribute('readonly')
  })
})
