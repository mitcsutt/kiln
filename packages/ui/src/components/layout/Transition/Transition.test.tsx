import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Transition } from './Transition'

function Panel({ open, ...props }: { open: boolean } & Partial<Parameters<typeof Transition>[0]>) {
  return (
    <Transition open={open} preset="slide-up" {...props}>
      <section aria-label="Chat with support">Two agents online</section>
    </Transition>
  )
}

describe('Transition', () => {
  it('renders nothing while closed and the element once open', () => {
    const { rerender } = render(<Panel open={false} />)
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    rerender(<Panel open />)
    const panel = screen.getByRole('region', { name: 'Chat with support' })
    expect(panel).toHaveAttribute('data-state', 'open')
    expect(panel).toHaveAttribute('data-preset', 'slide-up')
  })

  it('does not animate the first render, then animates every change', () => {
    const { rerender } = render(<Panel open />)
    expect(screen.getByRole('region')).not.toHaveAttribute('data-animate')
    rerender(<Panel open={false} keepMounted />)
    rerender(<Panel open keepMounted />)
    expect(screen.getByRole('region')).toHaveAttribute('data-animate')
  })

  it('animates the first render with appear', () => {
    render(<Panel open appear />)
    expect(screen.getByRole('region')).toHaveAttribute('data-animate')
  })

  it('unmounts after the exit, or hides with keepMounted', () => {
    const onComplete = vi.fn()
    const { rerender } = render(<Panel open onOpenChangeComplete={onComplete} />)
    rerender(<Panel open={false} onOpenChangeComplete={onComplete} />)
    expect(screen.queryByText('Two agents online')).not.toBeInTheDocument()
    expect(onComplete).toHaveBeenLastCalledWith(false)

    rerender(<Panel open keepMounted onOpenChangeComplete={onComplete} />)
    expect(onComplete).toHaveBeenLastCalledWith(true)
    rerender(<Panel open={false} keepMounted onOpenChangeComplete={onComplete} />)
    const hidden = screen.getByText('Two agents online')
    expect(hidden).toHaveAttribute('hidden')
    expect(hidden).toHaveAttribute('data-state', 'closed')
  })

  it('merges its class and ref onto the child', () => {
    const ref = createRef<HTMLElement>()
    render(
      <Transition ref={ref} open className="extra">
        <div className="own">Saved</div>
      </Transition>,
    )
    const node = screen.getByText('Saved')
    expect(ref.current).toBe(node)
    expect(node).toHaveClass('own', 'extra')
  })
})
