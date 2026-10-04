import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Container } from './Container'

describe('Container', () => {
  it('defaults to the content width with a gutter', () => {
    const { container } = render(<Container />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toHaveAttribute('data-width', 'content')
    expect(el).not.toHaveAttribute('data-gutter')
  })

  it('exposes width and gutter as data attributes', () => {
    const { container } = render(<Container width="text" gutter={false} />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toHaveAttribute('data-width', 'text')
    expect(el).toHaveAttribute('data-gutter', 'false')
  })

  it('renders landmarks via `as` and forwards refs', () => {
    const ref = createRef<HTMLElement>()
    render(<Container as="main" ref={ref} />)
    expect(screen.getByRole('main')).toBe(ref.current)
  })
})
