import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('renders a labelled nav with hide-above and position attributes', () => {
    render(
      <BottomNav label="Workspace" hideAbove="lg">
        <BottomNav.Item href="/calendar" icon={<svg />} label="Calendar" />
      </BottomNav>,
    )
    const nav = screen.getByRole('navigation', { name: 'Workspace' })
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
        <BottomNav.Item ref={ref} href="/projects" icon={<svg />} label="Projects" active />
        <BottomNav.Item href="/feed" icon={<svg />} label="Feed" badge={128} />
        <BottomNav.Item href="/team" icon={<svg />} label="Team" badge />
      </BottomNav>,
    )
    const projects = screen.getByRole('link', { name: 'Projects' })
    expect(ref.current).toBe(projects)
    expect(projects).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /^Feed\s?, 128 new$/ })).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByText('99+')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Team\s?, new$/ })).toBeInTheDocument()
  })

  it('renders a router link via asChild', () => {
    render(
      <BottomNav>
        <BottomNav.Item asChild icon={<svg />} label="Calendar" active>
          <a href="/calendar" data-router="" aria-label="Calendar" />
        </BottomNav.Item>
      </BottomNav>,
    )
    const link = screen.getByRole('link', { name: 'Calendar' })
    expect(link).toHaveAttribute('data-router')
    expect(link).toHaveAttribute('aria-current', 'page')
  })
})
