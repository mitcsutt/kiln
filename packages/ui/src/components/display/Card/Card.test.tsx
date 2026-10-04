import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Card } from './Card'

describe('Card', () => {
  it('forwards refs and exposes variant and interactive state', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<Card ref={ref} variant="raised" interactive />)
    const card = container.firstElementChild as HTMLElement
    expect(ref.current).toBe(card)
    expect(card).toHaveAttribute('data-variant', 'raised')
    expect(card).toHaveAttribute('data-interactive')
  })

  it('maps responsive padding to cascading variables and keeps consumer styles', () => {
    const { container } = render(<Card padding={{ base: 4, md: 6 }} style={{ maxWidth: 10 }} />)
    const card = container.firstElementChild as HTMLElement
    expect(card.style.getPropertyValue('--card-padding-base')).toBe('var(--space-4)')
    expect(card.style.getPropertyValue('--card-padding-md')).toBe('var(--space-6)')
    expect(card.style.maxWidth).toBe('10px')
  })

  it('renders the whole card as a link with asChild', () => {
    render(
      <Card asChild>
        <a href="/projects/atlas">
          <Card.Title level={2}>Atlas</Card.Title>
        </a>
      </Card>,
    )
    const link = screen.getByRole('link', { name: 'Atlas' })
    expect(link).toHaveAttribute('href', '/projects/atlas')
    expect(link).toHaveAttribute('data-interactive')
  })

  it('sets the title element from level (default h3)', () => {
    render(
      <Card>
        <Card.Title>Hawks v Millpond</Card.Title>
        <Card.Title level={4}>Harbour Park</Card.Title>
      </Card>,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Hawks v Millpond' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'Harbour Park' })).toBeInTheDocument()
  })

  it('marks media ratio and inset for styling', () => {
    const { container } = render(
      <Card>
        <Card.Media ratio="16/9" inset>
          <img src="/images/atlas.png" alt="" />
        </Card.Media>
      </Card>,
    )
    const media = container.querySelector('[data-ratio]')
    expect(media).toHaveAttribute('data-ratio', '16/9')
    expect(media).toHaveAttribute('data-inset')
  })
})
