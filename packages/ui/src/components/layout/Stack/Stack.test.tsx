import { render, screen } from '@testing-library/react'
import { Stack } from './Stack'

describe('Stack', () => {
  it('maps responsive gap to cascading CSS variables', () => {
    const { container } = render(<Stack gap={{ base: 2, md: 6 }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--stack-gap-base')).toBe('var(--space-2)')
    expect(el.style.getPropertyValue('--stack-gap-sm')).toBe('var(--space-2)')
    expect(el.style.getPropertyValue('--stack-gap-md')).toBe('var(--space-6)')
    expect(el.style.getPropertyValue('--stack-gap-xl')).toBe('var(--space-6)')
  })

  it('renders lists with list semantics', () => {
    render(
      <Stack as="ul">
        <li>One</li>
      </Stack>,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('keeps consumer styles', () => {
    const { container } = render(<Stack gap={3} style={{ maxWidth: 10 }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.maxWidth).toBe('10px')
  })

  it('adds responsive visibility classes and keeps consumer classes', () => {
    const { container } = render(<Stack hideBelow="md" hideAbove="xl" className="mine" />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toHaveClass('stack', 'hideBelowMd', 'hideAboveXl', 'mine')
  })

  it('adds no visibility class by default', () => {
    const { container } = render(<Stack />)
    expect((container.firstElementChild as HTMLElement).className).not.toMatch(/hide/)
  })
})
