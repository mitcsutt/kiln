import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tooltip, TooltipProvider } from './Tooltip'

describe('Tooltip', () => {
  it('shows on keyboard focus and describes the trigger', async () => {
    render(
      <Tooltip content="Copy share link">
        <button type="button" aria-label="Copy">
          ⧉
        </button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    await userEvent.tab()
    const trigger = screen.getByRole('button', { name: 'Copy' })
    expect(trigger).toHaveFocus()
    const tip = await screen.findByRole('tooltip')
    expect(tip).toHaveTextContent('Copy share link')
    expect(trigger).toHaveAccessibleDescription('Copy share link')
  })

  it('hides on Escape', async () => {
    render(
      <Tooltip content="Export CSV">
        <button type="button">Export</button>
      </Tooltip>,
    )
    await userEvent.tab()
    await screen.findByRole('tooltip')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('works inside a shared TooltipProvider and respects side', async () => {
    render(
      <TooltipProvider>
        <Tooltip content="Previous month" side="bottom" defaultOpen>
          <button type="button">August</button>
        </Tooltip>
      </TooltipProvider>,
    )
    await screen.findByRole('tooltip')
    // Radix renders the visible bubble plus a visually hidden copy for the role; where
    // data-side sits relative to the role node varies across Radix patch releases.
    expect(document.body.querySelector('[data-side]')).toHaveAttribute('data-side', 'bottom')
  })

  it('carries the trigger scope theme onto the portalled bubble', async () => {
    render(
      <div data-theme="fiesta">
        <Tooltip content="Northwind Studio, your largest client">
          <button type="button">NWS</button>
        </Tooltip>
      </div>,
    )
    await userEvent.tab()
    const tip = await screen.findByRole('tooltip')
    expect(tip.closest('[data-theme]')).toHaveAttribute('data-theme', 'fiesta')
    expect(tip.closest('[data-theme]')).not.toBe(document.documentElement)
  })
})
