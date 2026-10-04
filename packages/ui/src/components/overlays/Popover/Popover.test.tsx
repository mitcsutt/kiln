import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Popover } from './Popover'

function InvoiceDetails({ arrow }: { arrow?: boolean }) {
  return (
    <Popover>
      <Popover.Trigger>INV-1042</Popover.Trigger>
      <Popover.Content aria-label="Invoice details" arrow={arrow}>
        <p>Northwind Studio · due 14 October</p>
        <Popover.Close>Dismiss</Popover.Close>
      </Popover.Content>
    </Popover>
  )
}

describe('Popover', () => {
  it('opens from the trigger and reports expanded state', async () => {
    render(<InvoiceDetails />)
    const trigger = screen.getByRole('button', { name: 'INV-1042' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'Invoice details' })).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<InvoiceDetails />)
    const trigger = screen.getByRole('button', { name: 'INV-1042' })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes from Popover.Close', async () => {
    render(<InvoiceDetails />)
    await userEvent.click(screen.getByRole('button', { name: 'INV-1042' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders an arrow when asked', async () => {
    render(<InvoiceDetails arrow />)
    await userEvent.click(screen.getByRole('button', { name: 'INV-1042' }))
    expect(screen.getByRole('dialog').querySelector('svg')).toBeInTheDocument()
  })

  it('applies the trigger scope theme to the portalled content', async () => {
    render(
      <div data-theme="fiesta" data-density="compact">
        <InvoiceDetails />
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'INV-1042' }))
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
        <Popover.Trigger>Storage</Popover.Trigger>
        <Popover.Content aria-label="Plan usage" container={container}>
          81 GB of 100 GB
        </Popover.Content>
      </Popover>,
    )
    const content = screen.getByRole('dialog')
    expect(container).toContainElement(content)
    expect(content).toHaveAttribute('data-theme', 'ledger')
    container.remove()
  })
})
