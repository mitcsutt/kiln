import { render } from '@testing-library/react'
import { createRef } from 'react'
import { Box } from './Box'

describe('Box', () => {
  it('maps padding props to cascading per-axis vars', () => {
    const { container } = render(<Box padding={4} paddingX={{ base: 3, lg: 6 }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--box-p-base')).toBe('var(--space-4)')
    expect(el.style.getPropertyValue('--box-px-base')).toBe('var(--space-3)')
    expect(el.style.getPropertyValue('--box-px-md')).toBe('var(--space-3)')
    expect(el.style.getPropertyValue('--box-px-lg')).toBe('var(--space-6)')
    expect(el.style.getPropertyValue('--box-py-base')).toBe('')
  })

  it('exposes surface, border and radius as data attributes', () => {
    const { container } = render(<Box surface="inverse" border radius="surface" />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toHaveAttribute('data-surface', 'inverse')
    expect(el).toHaveAttribute('data-border')
    expect(el).toHaveAttribute('data-radius', 'surface')
  })

  it('omits attributes for the defaults', () => {
    const { container } = render(<Box />)
    const el = container.firstElementChild as HTMLElement
    expect(el).not.toHaveAttribute('data-surface')
    expect(el).not.toHaveAttribute('data-radius')
    expect(el).not.toHaveAttribute('data-border')
    expect(el).not.toHaveAttribute('data-adapt-tones')
  })

  it('re-points status tones only when asked', () => {
    const { container } = render(<Box surface="cat-2" adaptTones />)
    expect(container.firstElementChild).toHaveAttribute('data-adapt-tones')
  })

  it('renders the requested element and forwards refs', () => {
    const ref = createRef<HTMLElement>()
    const { container } = render(<Box as="aside" ref={ref} />)
    expect(container.firstElementChild?.tagName).toBe('ASIDE')
    expect(ref.current).toBe(container.firstElementChild)
  })

  it('paints a categorical surface', () => {
    const { container } = render(<Box surface="cat-7">Kelso Bay</Box>)
    expect(container.firstElementChild).toHaveAttribute('data-surface', 'cat-7')
  })
})
