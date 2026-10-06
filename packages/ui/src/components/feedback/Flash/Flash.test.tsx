import { render, screen } from '@testing-library/react'
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
})
