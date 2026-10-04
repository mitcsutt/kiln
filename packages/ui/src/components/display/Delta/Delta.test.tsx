import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Delta } from './Delta'
import { must } from '#test/must'

describe('Delta', () => {
  it('speaks the direction and the amount', () => {
    render(<Delta direction="up">1</Delta>)
    const el = must(screen.getByText('Up', { exact: false }).parentElement)
    expect(el).toHaveTextContent('Up 1')
    expect(el.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('derives the tone from the direction', () => {
    render(
      <>
        <Delta direction="up" data-testid="up">
          1
        </Delta>
        <Delta direction="down" data-testid="down">
          2
        </Delta>
        <Delta direction="flat" data-testid="flat" />
      </>,
    )
    expect(screen.getByTestId('up')).toHaveAttribute('data-tone', 'positive')
    expect(screen.getByTestId('down')).toHaveAttribute('data-tone', 'critical')
    expect(screen.getByTestId('down')).toHaveTextContent('Down 2')
    expect(screen.getByTestId('flat')).toHaveAttribute('data-tone', 'neutral')
    expect(screen.getByTestId('flat')).toHaveTextContent('No change')
  })

  it('lets the tone be overridden when down is good', () => {
    render(
      <Delta direction="down" tone="positive" data-testid="d">
        $84.20
      </Delta>,
    )
    expect(screen.getByTestId('d')).toHaveAttribute('data-tone', 'positive')
    expect(screen.getByTestId('d')).toHaveAttribute('data-direction', 'down')
  })

  it('forwards the ref and merges className', () => {
    const ref = createRef<HTMLSpanElement>()
    render(
      <Delta ref={ref} direction="up" className="x">
        3
      </Delta>,
    )
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current).toHaveClass('x')
  })
})
