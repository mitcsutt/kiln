import { render } from '@testing-library/react'
import { ActionBar } from './ActionBar'

describe('ActionBar', () => {
  it('defaults to align="end" and as="div"', () => {
    const { container } = render(<ActionBar>content</ActionBar>)
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveAttribute('data-align', 'end')
    expect(el).not.toHaveAttribute('data-sticky')
  })

  it('renders as a footer', () => {
    const { container } = render(<ActionBar as="footer">content</ActionBar>)
    expect((container.firstElementChild as HTMLElement).tagName).toBe('FOOTER')
  })

  it('sets the sticky data attribute', () => {
    const { container } = render(<ActionBar sticky>content</ActionBar>)
    expect(container.firstElementChild).toHaveAttribute('data-sticky', 'true')
  })

  it('maps align to the data attribute', () => {
    const { container, rerender } = render(<ActionBar align="start">content</ActionBar>)
    expect(container.firstElementChild).toHaveAttribute('data-align', 'start')
    rerender(<ActionBar align="between">content</ActionBar>)
    expect(container.firstElementChild).toHaveAttribute('data-align', 'between')
  })

  it('maps responsive gap to cascading CSS variables', () => {
    const { container } = render(<ActionBar gap={{ base: 2, lg: 5 }}>content</ActionBar>)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--action-bar-gap-base')).toBe('var(--space-2)')
    expect(el.style.getPropertyValue('--action-bar-gap-md')).toBe('var(--space-2)')
    expect(el.style.getPropertyValue('--action-bar-gap-lg')).toBe('var(--space-5)')
    expect(el.style.getPropertyValue('--action-bar-gap-xl')).toBe('var(--space-5)')
  })

  it('keeps consumer styles and classes', () => {
    const { container } = render(
      <ActionBar className="mine" style={{ maxWidth: 10 }}>
        content
      </ActionBar>,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el).toHaveClass('mine')
    expect(el.style.maxWidth).toBe('10px')
  })

  it('adds responsive visibility classes', () => {
    const { container } = render(
      <ActionBar hideBelow="md" hideAbove="xl">
        content
      </ActionBar>,
    )
    expect(container.firstElementChild).toHaveClass('hideBelowMd', 'hideAboveXl')
  })

  it('forwards a ref to the root element', () => {
    const ref = { current: null as HTMLElement | null }
    render(<ActionBar ref={ref}>content</ActionBar>)
    expect(ref.current?.tagName).toBe('DIV')
  })
})
