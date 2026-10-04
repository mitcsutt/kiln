import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { Dialog } from './Dialog'

function DeleteInvoice(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Dialog onOpenChange={props.onOpenChange}>
      <Dialog.Trigger>Delete invoice</Dialog.Trigger>
      <Dialog.Content
        size="sm"
        title="Delete invoice?"
        description="INV-1042 for Northwind Studio, $1,820.00."
      >
        <Dialog.Footer>
          <Dialog.Close>Keep it</Dialog.Close>
          <button type="button">Delete</button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('opens from the trigger and wires the title and description', async () => {
    render(<DeleteInvoice />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Delete invoice' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete invoice?' })
    expect(dialog).toHaveAttribute('data-size', 'sm')
    expect(dialog).toHaveAccessibleDescription('INV-1042 for Northwind Studio, $1,820.00.')
    expect(screen.getByRole('heading', { name: 'Delete invoice?' })).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn()
    render(<DeleteInvoice onOpenChange={onOpenChange} />)
    const trigger = screen.getByRole('button', { name: 'Delete invoice' })
    await userEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(trigger).toHaveFocus()
  })

  it('moves focus into the dialog, starting at the first action, not the close button', async () => {
    render(<DeleteInvoice />)
    await userEvent.click(screen.getByRole('button', { name: 'Delete invoice' }))
    expect(screen.getByRole('button', { name: 'Keep it' })).toHaveFocus()
  })

  it('closes from the corner button labelled "Close" and from Dialog.Close', async () => {
    render(<DeleteInvoice />)
    const trigger = screen.getByRole('button', { name: 'Delete invoice' })
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('hides the corner button with hideClose', () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content
          title="Import complete"
          description="48 contacts imported from 8 spreadsheets."
          hideClose
        >
          <Dialog.Close>Done</Dialog.Close>
        </Dialog.Content>
      </Dialog>,
    )
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('supports controlled use without a trigger and forwards the ref', async () => {
    const ref = createRef<HTMLDivElement>()
    function Controlled() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true)
            }}
          >
            Edit plan
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Content ref={ref} title="Edit plan" description="Team plan, billed monthly">
              <p>12 seats</p>
            </Dialog.Content>
          </Dialog>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit plan' }))
    expect(ref.current).toBe(screen.getByRole('dialog'))
  })

  it('carries the theme of the scope it was opened from onto the portalled content', async () => {
    render(
      <div data-theme="fiesta" data-mode="light">
        <DeleteInvoice />
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete invoice' }))
    const dialog = screen.getByRole('dialog')
    // Portalled to <body>, outside the Fiesta scope…
    expect(dialog.closest('[data-theme="fiesta"]')).toBe(dialog)
    // …but the content and scrim carry the scope's theme and mode themselves.
    expect(dialog).toHaveAttribute('data-theme', 'fiesta')
    expect(dialog).toHaveAttribute('data-mode', 'light')
    const overlay = document.body.querySelector('div[data-state="open"]:not([role="dialog"])')
    expect(overlay).toHaveAttribute('data-theme', 'fiesta')
  })

  it('reads the theme from the focused opener in controlled use', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false)
      return (
        <div data-theme="ledger">
          <button
            type="button"
            onClick={() => {
              setOpen(true)
            }}
          >
            Edit plan
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Content title="Edit plan" description="Team plan" />
          </Dialog>
        </div>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit plan' }))
    expect(screen.getByRole('dialog')).toHaveAttribute('data-theme', 'ledger')
  })
})
