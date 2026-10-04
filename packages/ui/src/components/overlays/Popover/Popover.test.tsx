import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Popover } from './Popover'

function MatchDetails({ arrow }: { arrow?: boolean }) {
  return (
    <Popover>
      <Popover.Trigger>Hawks v Millpond</Popover.Trigger>
      <Popover.Content aria-label="Match details" arrow={arrow}>
        <p>Millpond Ground · 16 June</p>
        <Popover.Close>Dismiss</Popover.Close>
      </Popover.Content>
    </Popover>
  )
}

describe('Popover', () => {
  it('opens from the trigger and reports expanded state', async () => {
    render(<MatchDetails />)
    const trigger = screen.getByRole('button', { name: 'Hawks v Millpond' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'Match details' })).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<MatchDetails />)
    const trigger = screen.getByRole('button', { name: 'Hawks v Millpond' })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes from Popover.Close', async () => {
    render(<MatchDetails />)
    await userEvent.click(screen.getByRole('button', { name: 'Hawks v Millpond' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders an arrow when asked', async () => {
    render(<MatchDetails arrow />)
    await userEvent.click(screen.getByRole('button', { name: 'Hawks v Millpond' }))
    expect(screen.getByRole('dialog').querySelector('svg')).toBeInTheDocument()
  })

  it('applies the trigger scope theme to the portalled content', async () => {
    render(
      <div data-theme="fiesta" data-density="compact">
        <MatchDetails />
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Hawks v Millpond' }))
    const content = screen.getByRole('dialog')
    expect(content).toHaveAttribute('data-theme', 'fiesta')
    expect(content).toHaveAttribute('data-density', 'compact')
  })

  it('uses an explicit container as the theme source and portal target', () => {
    const container = document.createElement('div')
    container.setAttribute('data-theme', 'ledger')
    document.body.append(container)
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Groceries</Popover.Trigger>
        <Popover.Content aria-label="Budget" container={container}>
          $612.35 of $850.00
        </Popover.Content>
      </Popover>,
    )
    const content = screen.getByRole('dialog')
    expect(container).toContainElement(content)
    expect(content).toHaveAttribute('data-theme', 'ledger')
    container.remove()
  })
})
