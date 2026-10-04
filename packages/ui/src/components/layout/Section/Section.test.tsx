import { render, screen } from '@testing-library/react'
import { Section } from './Section'

describe('Section', () => {
  it('renders a <section> by default', () => {
    render(<Section aria-label="Standings" />)
    expect(screen.getByRole('region', { name: 'Standings' }).tagName).toBe('SECTION')
  })

  it('maps responsive space to cascading block-padding vars', () => {
    const { container } = render(<Section space={{ base: 7, lg: 10 }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--section-space-base')).toBe('var(--space-7)')
    expect(el.style.getPropertyValue('--section-space-md')).toBe('var(--space-7)')
    expect(el.style.getPropertyValue('--section-space-lg')).toBe('var(--space-10)')
  })

  it('leaves space to the CSS default when unset', () => {
    const { container } = render(<Section />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--section-space-base')).toBe('')
  })

  it('exposes surface and divider as data attributes', () => {
    const { container } = render(<Section as="div" surface="inverse" divider="both" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveAttribute('data-surface', 'inverse')
    expect(el).toHaveAttribute('data-divider', 'both')
  })
})
