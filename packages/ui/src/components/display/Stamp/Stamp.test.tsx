import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Stamp } from './Stamp'

describe('Stamp', () => {
  it('reads as its text and forwards refs', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Stamp ref={ref}>Rejected</Stamp>)
    expect(ref.current).toBe(screen.getByText('Rejected'))
  })

  it('writes the rotation and exposes tone and size', () => {
    render(
      <Stamp tone="positive" size="lg" rotate={4} style={{ marginInlineStart: 8 }}>
        Paid
      </Stamp>,
    )
    const el = screen.getByText('Paid')
    expect(el.style.getPropertyValue('--stamp-rotate')).toBe('4deg')
    expect(el.style.marginInlineStart).toBe('8px')
    expect(el).toHaveAttribute('data-tone', 'positive')
    expect(el).toHaveAttribute('data-size', 'lg')
  })

  it('accepts an aria-label for more context', () => {
    render(
      <Stamp role="img" aria-label="Invoice 1039 overdue by 12 days">
        Rejected
      </Stamp>,
    )
    expect(screen.getByRole('img', { name: 'Invoice 1039 overdue by 12 days' })).toBeInTheDocument()
  })

  it('marks corner placement and leaves inline unmarked', () => {
    const { rerender } = render(<Stamp placement="corner">Paid</Stamp>)
    expect(screen.getByText('Paid')).toHaveAttribute('data-placement', 'corner')
    rerender(<Stamp>Paid</Stamp>)
    expect(screen.getByText('Paid')).not.toHaveAttribute('data-placement')
  })
})
