import { render, screen } from '@testing-library/react'
import { AspectRatio } from './AspectRatio'

const ratioOf = (el: Element | null) => (el as HTMLElement).style.getPropertyValue('--aspect-ratio')

describe('AspectRatio', () => {
  it('defaults to 16 / 9', () => {
    const { container } = render(<AspectRatio />)
    expect(ratioOf(container.firstElementChild)).toBe('16 / 9')
  })

  it('accepts presets and numbers', () => {
    const { container, rerender } = render(<AspectRatio ratio="3/4" />)
    expect(ratioOf(container.firstElementChild)).toBe('3 / 4')
    rerender(<AspectRatio ratio={1.91} />)
    expect(ratioOf(container.firstElementChild)).toBe('1.91')
  })

  it('renders its child', () => {
    render(
      <AspectRatio ratio="4/3">
        <img src="data:," alt="Spending dashboard" />
      </AspectRatio>,
    )
    expect(screen.getByRole('img', { name: 'Spending dashboard' })).toBeInTheDocument()
  })
})
