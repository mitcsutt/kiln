import { render, screen } from '@testing-library/react'
import { Quote } from './Quote'

describe('Quote', () => {
  it('renders a figure with blockquote and figcaption', () => {
    const { container } = render(
      <Quote cite="Rosa Nguyen" citeUrl="https://example.com/review" size="lg">
        Best onboarding we have shipped.
      </Quote>,
    )
    const figure = container.querySelector('figure')
    expect(figure).toHaveAttribute('data-size', 'lg')
    expect(container.querySelector('blockquote')).toHaveAttribute(
      'cite',
      'https://example.com/review',
    )
    expect(container.querySelector('figcaption')).toHaveTextContent('Rosa Nguyen')
  })

  it('hides the decorative quote mark from assistive tech', () => {
    const { container } = render(<Quote>Ship less, finish more.</Quote>)
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('“')
    expect(container.querySelector('figcaption')).toBeNull()
    expect(screen.getByText('Ship less, finish more.').tagName).toBe('BLOCKQUOTE')
  })
})
