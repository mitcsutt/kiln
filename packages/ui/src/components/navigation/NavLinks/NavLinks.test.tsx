import { render, screen } from '@testing-library/react'
import { createRef, forwardRef, type AnchorHTMLAttributes } from 'react'
import { NavLinks } from './NavLinks'

// Stand-in for a router <Link>.
const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(function RouterLink({ to, children, ...rest }, ref) {
  return (
    <a ref={ref} href={to} data-router="" {...rest}>
      {children}
    </a>
  )
})

describe('NavLinks', () => {
  it('renders a labelled nav landmark with a list of links', () => {
    render(
      <NavLinks label="Primary">
        <NavLinks.Item href="/work">Work</NavLinks.Item>
        <NavLinks.Item href="/writing">Writing</NavLinks.Item>
      </NavLinks>,
    )
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav).toHaveAttribute('data-orientation', 'horizontal')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('marks only the active item with aria-current="page"', () => {
    render(
      <NavLinks>
        <NavLinks.Item href="/work" active>
          Work
        </NavLinks.Item>
        <NavLinks.Item href="/about">About</NavLinks.Item>
      </NavLinks>,
    )
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  it('supports router links via asChild and forwards refs', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(
      <NavLinks orientation="vertical">
        <NavLinks.Item asChild active ref={ref}>
          <RouterLink to="/reports">Reports</RouterLink>
        </NavLinks.Item>
      </NavLinks>,
    )
    const link = screen.getByRole('link', { name: 'Reports' })
    expect(ref.current).toBe(link)
    expect(link).toHaveAttribute('data-router')
    expect(link).toHaveAttribute('href', '/reports')
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link).toHaveAttribute('data-orientation', 'vertical')
  })

  it('applies gap, size and visibility', () => {
    render(
      <NavLinks label="Footer" gap={3} size="sm" hideBelow="md">
        <NavLinks.Item href="/rss" hideAbove="lg">
          RSS
        </NavLinks.Item>
      </NavLinks>,
    )
    const nav = screen.getByRole('navigation', { name: 'Footer' })
    expect(nav).toHaveAttribute('data-size', 'sm')
    expect(nav).toHaveClass('hideBelowMd')
    expect(screen.getByRole('list').style.getPropertyValue('--_gap')).toBe('var(--space-3)')
    expect(screen.getByRole('link', { name: 'RSS' })).toHaveAttribute('data-size', 'sm')
    expect(screen.getByRole('listitem')).toHaveClass('hideAboveLg')
  })

  it('leaves the gap to CSS when not set', () => {
    render(
      <NavLinks>
        <NavLinks.Item href="/">Home</NavLinks.Item>
      </NavLinks>,
    )
    expect(screen.getByRole('list')).not.toHaveAttribute('style')
  })
})
