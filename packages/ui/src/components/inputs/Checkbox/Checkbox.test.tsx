import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { Checkbox, type CheckedState } from './Checkbox'

describe('Checkbox', () => {
  it('toggles uncontrolled and forwards the ref', async () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Checkbox ref={ref} aria-label="Paid" />)
    const box = screen.getByRole('checkbox', { name: 'Paid' })
    expect(ref.current).toBe(box)
    expect(box).not.toBeChecked()
    await userEvent.click(box)
    expect(box).toBeChecked()
    expect(box).toHaveAttribute('data-state', 'checked')
  })

  it('supports indeterminate (aria-checked="mixed")', async () => {
    function SelectAll() {
      const [state, setState] = useState<CheckedState>('indeterminate')
      return <Checkbox aria-label="Select all" checked={state} onCheckedChange={setState} />
    }
    render(<SelectAll />)
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('aria-checked', 'mixed')
    expect(box).toHaveAttribute('data-state', 'indeterminate')
    await userEvent.click(box)
    expect(box).toHaveAttribute('aria-checked', 'true')
  })

  it('toggles with the Space key', async () => {
    render(<Checkbox aria-label="Paid" />)
    const box = screen.getByRole('checkbox')
    box.focus()
    await userEvent.keyboard(' ')
    expect(box).toBeChecked()
  })

  it('reflects invalid and size', () => {
    render(<Checkbox aria-label="Paid" invalid size="lg" />)
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveAttribute('data-invalid')
    expect(box).toHaveAttribute('data-size', 'lg')
  })

  it('readOnly sets aria-readonly and ignores clicks', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Checkbox aria-label="Paid" checked={false} onCheckedChange={onCheckedChange} readOnly />,
    )
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(box)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(box).not.toBeChecked()
  })
})
