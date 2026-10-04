import { render, screen } from '@testing-library/react'
import { StatusDot } from './StatusDot'

describe('StatusDot', () => {
  it('shows its label next to a decorative dot', () => {
    const { container } = render(<StatusDot tone="positive" label="Paid" />)
    expect(screen.getByText('Paid')).toBeVisible()
    expect(container.firstElementChild).toHaveAttribute('data-tone', 'positive')
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('keeps a hidden label available to assistive tech', () => {
    const { container } = render(<StatusDot tone="critical" label="Overdue" labelHidden />)
    expect(container.firstElementChild).toHaveTextContent('Overdue')
    expect(container.firstElementChild).toHaveAttribute('data-label-hidden')
  })
})
