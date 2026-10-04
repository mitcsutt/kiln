import { render, screen } from '@testing-library/react'
import { VisuallyHidden } from './VisuallyHidden'

describe('VisuallyHidden', () => {
  it('stays in the accessibility tree', () => {
    render(
      <button type="button">
        <svg aria-hidden="true" />
        <VisuallyHidden>Open menu</VisuallyHidden>
      </button>,
    )
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  it('renders headings via `as`', () => {
    render(<VisuallyHidden as="h2">Group standings</VisuallyHidden>)
    expect(screen.getByRole('heading', { level: 2, name: 'Group standings' })).toBeInTheDocument()
  })

  it('marks focusable content so it can reveal on focus', () => {
    render(
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>,
    )
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('data-focusable')
  })
})
