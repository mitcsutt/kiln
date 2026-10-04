import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Text } from './Text'

describe('Text', () => {
  it('renders a paragraph by default and forwards refs', () => {
    const ref = createRef<HTMLElement>()
    render(<Text ref={ref}>Budget resets on the 1st.</Text>)
    const p = screen.getByText('Budget resets on the 1st.')
    expect(p.tagName).toBe('P')
    expect(ref.current).toBe(p)
  })

  it('inherits by default: no size, tone or weight attributes', () => {
    render(<Text as="span">Brazil</Text>)
    const el = screen.getByText('Brazil')
    expect(el).not.toHaveAttribute('data-size')
    expect(el).not.toHaveAttribute('data-tone')
    expect(el).not.toHaveAttribute('data-weight')
  })

  it('exposes size, tone, weight, numeric and align', () => {
    render(
      <Text size="sm" tone="critical" weight="strong" numeric align="end">
        −$82.40
      </Text>,
    )
    const el = screen.getByText('−$82.40')
    expect(el).toHaveAttribute('data-size', 'sm')
    expect(el).toHaveAttribute('data-tone', 'critical')
    expect(el).toHaveAttribute('data-weight', 'strong')
    expect(el).toHaveAttribute('data-numeric')
    expect(el).toHaveAttribute('data-align', 'end')
  })

  it('maps a responsive size to vars', () => {
    render(<Text size={{ base: 'md', lg: 'lg' }}>Lede</Text>)
    const el = screen.getByText('Lede')
    expect(el).toHaveAttribute('data-responsive')
    expect(el.style.getPropertyValue('--text-size-base')).toBe('var(--text-md)')
    expect(el.style.getPropertyValue('--text-size-xl')).toBe('var(--text-lg)')
  })

  it('truncates to one line or clamps to n lines', () => {
    const { rerender } = render(<Text truncate>Long</Text>)
    expect(screen.getByText('Long')).toHaveAttribute('data-truncate', 'line')
    rerender(<Text truncate={3}>Long</Text>)
    const el = screen.getByText('Long')
    expect(el).toHaveAttribute('data-truncate', 'lines')
    expect(el.style.getPropertyValue('--text-lines')).toBe('3')
  })

  it('passes htmlFor and dateTime through for label and time', () => {
    render(
      <>
        <Text as="label" htmlFor="amount">
          Amount
        </Text>
        <Text as="time" dateTime="2026-06-11">
          11 June
        </Text>
      </>,
    )
    expect(screen.getByText('Amount')).toHaveAttribute('for', 'amount')
    expect(screen.getByText('11 June')).toHaveAttribute('datetime', '2026-06-11')
  })

  it('caps the line length with a measure', () => {
    render(<Text measure="text">Every dollar has a job before the month starts.</Text>)
    expect(screen.getByText(/Every dollar/)).toHaveAttribute('data-measure', 'text')
  })
})
