import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Link } from './Link'

describe('Link', () => {
  it('renders an anchor with tone and underline attributes', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(
      <Link ref={ref} href="/work" tone="accent" underline="hover">
        Read the release notes
      </Link>,
    )
    const a = screen.getByRole('link', { name: 'Read the release notes' })
    expect(a).toHaveAttribute('href', '/work')
    expect(a).toHaveAttribute('data-tone', 'accent')
    expect(a).toHaveAttribute('data-underline', 'hover')
    expect(a).not.toHaveAttribute('target')
    expect(ref.current).toBe(a)
  })

  it('opens external links safely and announces the new tab', () => {
    render(
      <Link href="https://github.com/mitcsutt/kiln" external>
        GitHub
      </Link>,
    )
    const a = screen.getByRole('link', { name: 'GitHub (opens in new tab)' })
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    expect(a.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('lets consumers override target and rel', () => {
    render(
      <Link href="https://example.com" external rel="noopener" target="docs">
        Docs
      </Link>,
    )
    const a = screen.getByRole('link')
    expect(a).toHaveAttribute('rel', 'noopener')
    expect(a).toHaveAttribute('target', 'docs')
  })

  it('renders its child when asChild (router links)', () => {
    render(
      <Link asChild tone="muted">
        <a href="/blog">Writing</a>
      </Link>,
    )
    const a = screen.getByRole('link', { name: 'Writing' })
    expect(a).toHaveAttribute('href', '/blog')
    expect(a).toHaveAttribute('data-tone', 'muted')
  })
})
