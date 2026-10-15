import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Collapsible } from './Collapsible'

function Advanced(props: Parameters<typeof Collapsible>[0]) {
  return (
    <Collapsible {...props}>
      <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
      <Collapsible.Content>
        <label>
          Webhook secret <input />
        </label>
      </Collapsible.Content>
    </Collapsible>
  )
}

describe('Collapsible', () => {
  it('wires the trigger to the content with aria-expanded and aria-controls', async () => {
    render(<Advanced />)
    const trigger = screen.getByRole('button', { name: 'Advanced options' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    const contentId = trigger.getAttribute('aria-controls')
    const content = document.getElementById(contentId ?? '')
    expect(content).toHaveAttribute('hidden')

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('data-state', 'open')
    expect(content).not.toHaveAttribute('hidden')
    expect(screen.getByRole('textbox', { name: 'Webhook secret' })).toBeVisible()
  })

  it('opens and closes from the keyboard', async () => {
    render(<Advanced />)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard(' ')
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('supports controlled state', async () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(<Advanced open={false} onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    rerender(<Advanced open onOpenChange={onOpenChange} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('starts open with defaultOpen and ignores clicks when disabled', async () => {
    render(<Advanced defaultOpen disabled />)
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toBeDisabled()
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders your own trigger with asChild and forwards refs', async () => {
    const ref = createRef<HTMLButtonElement>()
    const onClick = vi.fn()
    render(
      <Collapsible>
        <Collapsible.Trigger asChild ref={ref} onClick={onClick}>
          <button type="button" className="mine">
            Show the formula
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>Score = wins × 3 + draws</Collapsible.Content>
      </Collapsible>,
    )
    const trigger = screen.getByRole('button', { name: 'Show the formula' })
    expect(ref.current).toBe(trigger)
    expect(trigger).toHaveClass('mine')
    await userEvent.click(trigger)
    expect(onClick).toHaveBeenCalled()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('throws a clear error outside a Collapsible', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Collapsible.Trigger>Orphan</Collapsible.Trigger>)).toThrow(
      'Collapsible.Trigger must be inside <Collapsible>.',
    )
    vi.restoreAllMocks()
  })
})
