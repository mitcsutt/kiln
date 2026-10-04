import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('defaults to a small soft neutral badge and forwards refs', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Badge ref={ref}>3 new</Badge>)
    const badge = screen.getByText('3 new')
    expect(ref.current).toBe(badge)
    expect(badge).toHaveAttribute('data-tone', 'neutral')
    expect(badge).toHaveAttribute('data-variant', 'soft')
    expect(badge).toHaveAttribute('data-size', 'sm')
  })

  it('renders a decorative dot that is hidden from assistive tech', () => {
    render(
      <Badge tone="critical" variant="solid" dot>
        Live
      </Badge>,
    )
    const badge = screen.getByText('Live')
    expect(badge).toHaveAttribute('data-tone', 'critical')
    expect(badge.querySelector('[aria-hidden="true"]')).not.toBeNull()
    expect(badge).toHaveTextContent(/^Live$/)
  })
})
