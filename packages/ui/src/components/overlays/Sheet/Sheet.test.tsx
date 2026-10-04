import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sheet, type SheetContentProps } from './Sheet'

function YourOrder({ side }: { side?: SheetContentProps['side'] }) {
  return (
    <Sheet>
      <Sheet.Trigger>Your order</Sheet.Trigger>
      <Sheet.Content side={side} title="Your order" description="Noor · 6 items, $142.00">
        <p>Notebook, pencils, desk lamp</p>
        <Sheet.Footer>
          <Sheet.Close>Done</Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  )
}

describe('Sheet', () => {
  it('is a labelled modal dialog with a description', async () => {
    render(<YourOrder />)
    await userEvent.click(screen.getByRole('button', { name: 'Your order' }))
    const sheet = screen.getByRole('dialog', { name: 'Your order' })
    expect(sheet).toHaveAccessibleDescription('Noor · 6 items, $142.00')
    expect(sheet).toHaveAttribute('data-side', 'right')
    expect(sheet).toHaveAttribute('data-size', 'md')
  })

  it('traps focus, closes on Escape and returns focus', async () => {
    render(<YourOrder side="bottom" />)
    const trigger = screen.getByRole('button', { name: 'Your order' })
    await userEvent.click(trigger)
    const sheet = screen.getByRole('dialog')
    expect(sheet).toContainElement(document.activeElement as HTMLElement)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    expect(sheet).toContainElement(document.activeElement as HTMLElement)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('shows a decorative grab handle only on bottom sheets', async () => {
    const { unmount } = render(<YourOrder side="bottom" />)
    await userEvent.click(screen.getByRole('button', { name: 'Your order' }))
    expect(screen.getByRole('dialog').querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    unmount()
  })

  it('closes from the corner close button', async () => {
    render(<YourOrder />)
    await userEvent.click(screen.getByRole('button', { name: 'Your order' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('carries the trigger scope theme onto the portalled panel', async () => {
    render(
      <div data-theme="fiesta" data-mode="dark">
        <YourOrder side="bottom" />
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Your order' }))
    expect(screen.getByRole('dialog')).toHaveAttribute('data-theme', 'fiesta')
    expect(screen.getByRole('dialog')).toHaveAttribute('data-mode', 'dark')
  })

  it('writes a side per breakpoint and keeps the handle for a responsive bottom sheet', async () => {
    render(<YourOrder side={{ base: 'bottom', md: 'right' }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Your order' }))
    const sheet = screen.getByRole('dialog')
    expect(sheet).toHaveAttribute('data-side', 'bottom')
    expect(sheet).toHaveAttribute('data-side-md', 'right')
    expect(sheet).not.toHaveAttribute('data-side-lg')
    expect(sheet.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('renders no handle when no breakpoint is bottom', async () => {
    render(<YourOrder side={{ base: 'right', lg: 'left' }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Your order' }))
    const sheet = screen.getByRole('dialog')
    expect(sheet).toHaveAttribute('data-side-lg', 'left')
    expect(sheet.querySelector('.handle')).toBeNull()
  })
})
