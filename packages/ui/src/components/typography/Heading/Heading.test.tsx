import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Heading } from './Heading'

describe('Heading', () => {
  it('renders the element for its level and forwards refs', () => {
    const ref = createRef<HTMLHeadingElement>()
    render(
      <Heading ref={ref} level={3}>
        Open tasks by project
      </Heading>,
    )
    const h = screen.getByRole('heading', { level: 3, name: 'Open tasks by project' })
    expect(h.tagName).toBe('H3')
    expect(ref.current).toBe(h)
  })

  it('derives size from level when no size is given', () => {
    render(<Heading level={1}>Ada Okafor</Heading>)
    const h = screen.getByRole('heading')
    expect(h).toHaveAttribute('data-size', 'display-md')
    expect(h).toHaveAttribute('data-role', 'display')
  })

  it('keeps level and size independent', () => {
    render(
      <Heading level={1} size="xl">
        September invoices
      </Heading>,
    )
    const h = screen.getByRole('heading', { level: 1 })
    expect(h).toHaveAttribute('data-size', 'xl')
    expect(h).toHaveAttribute('data-role', 'heading')
  })

  it('maps a responsive size to vars and per-breakpoint roles', () => {
    render(
      <Heading level={2} size={{ base: '2xl', md: 'display-sm' }}>
        Recent releases
      </Heading>,
    )
    const h = screen.getByRole('heading')
    expect(h).toHaveAttribute('data-size', '2xl')
    expect(h).toHaveAttribute('data-role', 'heading')
    expect(h).toHaveAttribute('data-role-sm', 'heading')
    expect(h).toHaveAttribute('data-role-md', 'display')
    expect(h).toHaveAttribute('data-role-xl', 'display')
    expect(h.style.getPropertyValue('--heading-size-base')).toBe('var(--text-2xl)')
    expect(h.style.getPropertyValue('--heading-size-lg')).toBe('var(--text-display-sm)')
  })

  it('keeps heading semantics when rendered as another element', () => {
    render(
      <Heading level={4} as="p">
        Releases
      </Heading>,
    )
    const h = screen.getByRole('heading', { level: 4 })
    expect(h.tagName).toBe('P')
  })

  it('exposes tone and balance as data attributes', () => {
    render(
      <Heading tone="muted" balance={false}>
        Archive
      </Heading>,
    )
    const h = screen.getByRole('heading')
    expect(h).toHaveAttribute('data-tone', 'muted')
    expect(h).toHaveAttribute('data-balance', 'false')
  })

  it('caps the line length with a measure', () => {
    render(<Heading measure="narrow">Recent releases</Heading>)
    expect(screen.getByRole('heading')).toHaveAttribute('data-measure', 'narrow')
  })
})
