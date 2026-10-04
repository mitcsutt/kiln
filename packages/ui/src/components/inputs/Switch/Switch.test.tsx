import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Switch } from './Switch'

describe('Switch', () => {
  it('toggles on click and calls onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    const ref = createRef<HTMLButtonElement>()
    render(<Switch ref={ref} aria-label="Repeats monthly" onCheckedChange={onCheckedChange} />)
    const sw = screen.getByRole('switch', { name: 'Repeats monthly' })
    expect(ref.current).toBe(sw)
    expect(sw).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('is labelled by its inline label, which also toggles it', async () => {
    render(<Switch label="Repeats monthly" />)
    const sw = screen.getByRole('switch', { name: 'Repeats monthly' })
    await userEvent.click(screen.getByText('Repeats monthly'))
    expect(sw).toHaveAttribute('data-state', 'checked')
  })

  it('respects controlled checked and disabled', async () => {
    const onCheckedChange = vi.fn()
    render(<Switch aria-label="Sync" checked disabled onCheckedChange={onCheckedChange} />)
    const sw = screen.getByRole('switch')
    await userEvent.click(sw)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(sw).toBeDisabled()
  })

  it('readOnly sets aria-readonly and ignores toggling', async () => {
    const onCheckedChange = vi.fn()
    render(<Switch aria-label="Sync" checked={false} onCheckedChange={onCheckedChange} readOnly />)
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(sw)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })
})
