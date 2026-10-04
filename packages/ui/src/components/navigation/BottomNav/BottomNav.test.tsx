import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('renders a labelled nav with hide-above and position attributes', () => {
    render(
      <BottomNav label="Matchday" hideAbove="lg">
        <BottomNav.Item href="/fixtures" icon={<svg />} label="Fixtures" />
      </BottomNav>,
    )
    const nav = screen.getByRole('navigation', { name: 'Matchday' })
    expect(nav).toHaveAttribute('data-hide-above', 'lg')
    expect(nav).toHaveAttribute('data-position', 'fixed')
  })

  it('omits hide-above when false', () => {
    render(
      <BottomNav hideAbove={false} position="static">
        <BottomNav.Item href="/" icon={<svg />} label="Home" />
      </BottomNav>,
    )
    expect(screen.getByRole('navigation')).not.toHaveAttribute('data-hide-above')
  })

  it('marks the active item and announces badges after the label', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(
      <BottomNav>
        <BottomNav.Item ref={ref} href="/table" icon={<svg />} label="Table" active />
        <BottomNav.Item href="/feed" icon={<svg />} label="Feed" badge={128} />
        <BottomNav.Item href="/squads" icon={<svg />} label="Squads" badge />
      </BottomNav>,
    )
    const table = screen.getByRole('link', { name: 'Table' })
    expect(ref.current).toBe(table)
    expect(table).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /^Feed\s?, 128 new$/ })).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByText('99+')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Squads\s?, new$/ })).toBeInTheDocument()
  })

  it('renders a router link via asChild', () => {
    render(
      <BottomNav>
        <BottomNav.Item asChild icon={<svg />} label="Fixtures" active>
          <a href="/fixtures" data-router="" aria-label="Fixtures" />
        </BottomNav.Item>
      </BottomNav>,
    )
    const link = screen.getByRole('link', { name: 'Fixtures' })
    expect(link).toHaveAttribute('data-router')
    expect(link).toHaveAttribute('aria-current', 'page')
  })
})
