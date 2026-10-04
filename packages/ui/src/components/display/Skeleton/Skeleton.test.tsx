import { render } from '@testing-library/react'
import { createRef } from 'react'
import { Skeleton } from './Skeleton'
import { must } from '#test/must'

describe('Skeleton', () => {
  it('is hidden from assistive tech and forwards refs', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<Skeleton ref={ref} />)
    expect(ref.current).toBe(container.firstElementChild)
    expect(ref.current).toHaveAttribute('aria-hidden', 'true')
  })

  it('maps width and height keys to CSS variables', () => {
    const { container } = render(<Skeleton width="1/2" height="heading" radius="surface" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--skeleton-width')).toBe('50%')
    expect(el.style.getPropertyValue('--skeleton-height')).toBe(
      'calc(var(--text-xl) * var(--leading-snug))',
    )
    expect(el).toHaveAttribute('data-radius', 'surface')
  })

  it('maps space steps', () => {
    const { container } = render(<Skeleton width={8} height={4} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--skeleton-width')).toBe('var(--space-8)')
    expect(el.style.getPropertyValue('--skeleton-height')).toBe('var(--space-4)')
  })

  it('renders text lines via lines or Skeleton.Text', () => {
    const { container, rerender } = render(<Skeleton lines={4} />)
    expect(must(container.firstElementChild).children).toHaveLength(4)
    rerender(<Skeleton.Text lines={2} gap={3} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.children).toHaveLength(2)
    expect(el.style.getPropertyValue('--skeleton-gap')).toBe('var(--space-3)')
  })

  it('renders a circle with a size', () => {
    const { container } = render(<Skeleton.Circle size="lg" />)
    expect(container.firstElementChild).toHaveAttribute('data-size', 'lg')
  })
})
