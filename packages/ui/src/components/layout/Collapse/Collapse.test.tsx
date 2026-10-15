import { render, screen } from '@testing-library/react'
import { createRef, useState } from 'react'
import userEvent from '@testing-library/user-event'
import { Collapse } from './Collapse'

function Toggle({ keepMounted, onComplete }: { keepMounted?: boolean; onComplete?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="refunds"
        onClick={() => {
          setOpen(!open)
        }}
      >
        Refund rules
      </button>
      <Collapse
        id="refunds"
        open={open}
        keepMounted={keepMounted}
        onOpenChangeComplete={onComplete}
      >
        <p>Refunds go back to the original card within five working days.</p>
      </Collapse>
    </>
  )
}

describe('Collapse', () => {
  it('hides closed content but keeps it mounted by default', () => {
    const { container } = render(<Toggle />)
    const region = container.querySelector('#refunds')
    expect(region).toHaveAttribute('data-state', 'closed')
    expect(region).toHaveAttribute('hidden')
    expect(screen.queryByText(/original card/)).not.toBeVisible()
    expect(container.querySelector('p')).toBeInTheDocument()
  })

  it('opens and closes, reporting each finish', async () => {
    const onComplete = vi.fn()
    const { container } = render(<Toggle onComplete={onComplete} />)
    const button = screen.getByRole('button', { name: 'Refund rules' })
    await userEvent.click(button)
    const region = container.querySelector('#refunds')
    expect(region).toHaveAttribute('data-state', 'open')
    expect(region).not.toHaveAttribute('hidden')
    expect(screen.getByText(/original card/)).toBeVisible()
    expect(onComplete).toHaveBeenLastCalledWith(true)

    await userEvent.click(button)
    expect(region).toHaveAttribute('data-state', 'closed')
    expect(region).toHaveAttribute('hidden')
    expect(onComplete).toHaveBeenLastCalledWith(false)
  })

  it('unmounts closed content with keepMounted={false}', async () => {
    render(<Toggle keepMounted={false} />)
    expect(screen.queryByText(/original card/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Refund rules' }))
    expect(screen.getByText(/original card/)).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Refund rules' }))
    expect(screen.queryByText(/original card/)).not.toBeInTheDocument()
  })

  it('renders open content without animating on mount, and forwards ref and props', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Collapse ref={ref} open className="extra" data-testid="c">
        Ready
      </Collapse>,
    )
    const region = screen.getByTestId('c')
    expect(ref.current).toBe(region)
    expect(region).toHaveClass('extra')
    expect(region).not.toHaveAttribute('data-animating')
    expect(region).toHaveTextContent('Ready')
  })
})
