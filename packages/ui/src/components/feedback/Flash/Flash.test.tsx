import { act, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Flash } from './Flash'

describe('Flash', () => {
  it('adds no element of its own, and forwards its class and ref to the child', () => {
    const ref = createRef<HTMLElement>()
    const { container } = render(
      <Flash ref={ref} className="extra">
        <p>Kelso Bay 2</p>
      </Flash>,
    )
    const child = screen.getByText('Kelso Bay 2')
    expect(ref.current).toBe(child)
    expect(child).toHaveClass('extra')
    expect(container.firstElementChild).toBe(child)
  })

  it('stays still on the first render and flashes each time the value changes', () => {
    const { rerender } = render(
      <Flash value={1}>
        <p>Score</p>
      </Flash>,
    )
    const score = screen.getByText('Score')
    expect(score).not.toHaveAttribute('data-flash')

    rerender(
      <Flash value={2}>
        <p>Score</p>
      </Flash>,
    )
    expect(score).toHaveAttribute('data-flash', 'odd')

    rerender(
      <Flash value={3}>
        <p>Score</p>
      </Flash>,
    )
    expect(score).toHaveAttribute('data-flash', 'even')

    rerender(
      <Flash value={3}>
        <p>Score</p>
      </Flash>,
    )
    expect(score).toHaveAttribute('data-flash', 'even')
  })

  it("doesn't flash on appear during the page's first render", async () => {
    vi.resetModules()
    const { Flash: FreshFlash } = await import('./Flash')
    render(
      <FreshFlash appear>
        <p>First goal</p>
      </FreshFlash>,
    )
    expect(screen.getByText('First goal')).not.toHaveAttribute('data-flash')
  })

  it('flashes on appear once the page has rendered', () => {
    const { rerender } = render(
      <div>
        <Flash appear>
          <p>Kelso Bay 1</p>
        </Flash>
      </div>,
    )
    rerender(
      <div>
        <Flash appear>
          <p>Kelso Bay 1</p>
        </Flash>
        <Flash appear>
          <p>North Point 1</p>
        </Flash>
      </div>,
    )
    expect(screen.getByText('North Point 1')).toHaveAttribute('data-flash', 'odd')
  })

  it('flashes when target turns true', () => {
    const { rerender } = render(
      <Flash target={false}>
        <p>07:35 sailing</p>
      </Flash>,
    )
    const row = screen.getByText('07:35 sailing')
    expect(row).not.toHaveAttribute('data-flash')
    rerender(
      <Flash target>
        <p>07:35 sailing</p>
      </Flash>,
    )
    expect(row).toHaveAttribute('data-flash', 'odd')
  })

  it('flashes when a hash change or history move lands on its id', () => {
    render(
      <Flash>
        <p id="sailing-0735">07:35 sailing</p>
      </Flash>,
    )
    const row = screen.getByText('07:35 sailing')
    window.history.replaceState(null, '', '#sailing-0735')
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(row).toHaveAttribute('data-flash', 'odd')
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(row).toHaveAttribute('data-flash', 'even')
    window.history.replaceState(null, '', '#elsewhere')
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(row).toHaveAttribute('data-flash', 'even')
    window.history.replaceState(null, '', ' ')
  })
})
