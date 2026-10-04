import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { LiveIndicator } from './LiveIndicator'
import { must } from '#test/must'

describe('LiveIndicator', () => {
  it('reads as its label and hides the dot', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(<LiveIndicator ref={ref} label="72'" />)
    expect(screen.getByText("72'")).toBeInTheDocument()
    expect(ref.current).toBe(container.firstElementChild)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('defaults to a pulsing accent inline indicator', () => {
    const { container } = render(<LiveIndicator />)
    const el = must(container.firstElementChild)
    expect(el).toHaveTextContent('Live')
    expect(el).toHaveAttribute('data-tone', 'accent')
    expect(el).toHaveAttribute('data-variant', 'inline')
    expect(el).toHaveAttribute('data-pulse')
  })

  it('can stop pulsing and switch variant', () => {
    const { container } = render(<LiveIndicator pulse={false} variant="pill" tone="critical" />)
    const el = must(container.firstElementChild)
    expect(el).not.toHaveAttribute('data-pulse')
    expect(el).toHaveAttribute('data-variant', 'pill')
    expect(el).toHaveAttribute('data-tone', 'critical')
  })

  it('is not a live region', () => {
    render(<LiveIndicator />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
