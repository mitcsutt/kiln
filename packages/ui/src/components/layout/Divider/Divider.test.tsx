import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Divider } from './Divider'

describe('Divider', () => {
  it('is a horizontal separator by default and forwards refs', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Divider ref={ref} />)
    const sep = screen.getByRole('separator')
    expect(sep).toBe(ref.current)
    expect(sep).not.toHaveAttribute('aria-orientation')
    expect(sep).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('announces vertical orientation', () => {
    render(<Divider orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('is named by its label', () => {
    render(<Divider label="Earlier this week" labelPosition="center" />)
    const sep = screen.getByRole('separator', { name: 'Earlier this week' })
    expect(sep).toHaveAttribute('data-label-position', 'center')
  })

  it('ignores a label on a vertical rule', () => {
    render(<Divider orientation="vertical" label="Ignored" />)
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
  })

  it('can be hidden from assistive tech', () => {
    render(<Divider decorative />)
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('maps spacing and strong', () => {
    const { container } = render(<Divider spacing={6} strong />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--divider-spacing')).toBe('var(--space-6)')
    expect(el).toHaveAttribute('data-strong')
  })
})
