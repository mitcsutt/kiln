import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { CheckboxField } from './CheckboxField'

describe('CheckboxField', () => {
  it('labels the checkbox and forwards the ref', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<CheckboxField ref={ref} label="I've read the house rules" />)
    const box = screen.getByLabelText("I've read the house rules")
    expect(box).toHaveRole('checkbox')
    expect(ref.current).toBe(box)
  })

  it('calls onCheckedChange with a boolean (legacy signature)', async () => {
    const onCheckedChange = vi.fn()
    render(<CheckboxField label="Agree" checked={false} onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('clicking an indeterminate box reports true', async () => {
    const onCheckedChange = vi.fn()
    render(
      <CheckboxField label="All tasks" checked="indeterminate" onCheckedChange={onCheckedChange} />,
    )
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed')
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('wires description and error and marks invalid', () => {
    render(
      <CheckboxField
        label="Agree"
        description="You can leave any time"
        error="You must agree"
        required
        id="agree"
      />,
    )
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('id', 'agree')
    expect(screen.getByRole('alert')).toHaveTextContent('You must agree')
    expect(box).toHaveAccessibleDescription('You can leave any time You must agree')
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveAttribute('aria-required', 'true')
  })

  it('shows warning, validating and readOnly', async () => {
    const onCheckedChange = vi.fn()
    render(
      <CheckboxField
        label="Agree"
        warning="Most people leave this on"
        validating
        readOnly
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    )
    expect(screen.getByText('Most people leave this on')).toBeInTheDocument()
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('aria-busy', 'true')
    expect(box).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(box)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('passes onBlur and disabled through', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <CheckboxField label="Agree" onBlur={onBlur} />
        <CheckboxField label="Locked" disabled />
      </>,
    )
    await userEvent.click(screen.getByLabelText('Agree'))
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalled()
    expect(screen.getByLabelText('Locked')).toBeDisabled()
  })
})
