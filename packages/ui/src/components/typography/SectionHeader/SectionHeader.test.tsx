import { render, screen } from '@testing-library/react'
import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
  it('renders an h2 by default with kicker and description in an hgroup', () => {
    const { container } = render(
      <SectionHeader
        kicker="2025–26 financial year"
        title="September invoices"
        description="$4,182.60 of $5,200 target"
      />,
    )
    const h = screen.getByRole('heading', { level: 2, name: 'September invoices' })
    const hgroup = container.querySelector('hgroup')
    expect(hgroup).toContainElement(h)
    expect(hgroup).toHaveTextContent('2025–26 financial year')
    expect(hgroup).toHaveTextContent('$4,182.60 of $5,200 target')
  })

  it('passes level, size and titleId to the heading', () => {
    render(<SectionHeader level={1} size="display-lg" title="Ada Okafor" titleId="page-title" />)
    const h = screen.getByRole('heading', { level: 1 })
    expect(h).toHaveAttribute('data-size', 'display-lg')
    expect(h).toHaveAttribute('id', 'page-title')
  })

  it('renders actions outside the hgroup and flags them for layout', () => {
    const { container } = render(
      <SectionHeader
        title="Recent releases"
        actions={<a href="/releases">All releases</a>}
        divider
      />,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveAttribute('data-has-actions')
    expect(root).toHaveAttribute('data-divider')
    expect(container.querySelector('hgroup')).not.toContainElement(screen.getByRole('link'))
  })
})
