import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the title as a heading with description and action', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <EmptyState
        ref={ref}
        title="No expenses yet"
        description="Add one, or import a CSV from your bank."
        action={<button type="button">Add expense</button>}
      />,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'No expenses yet' })).toBeInTheDocument()
    expect(screen.getByText('Add one, or import a CSV from your bank.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add expense' })).toBeInTheDocument()
    expect(ref.current).toHaveAttribute('data-align', 'start')
  })

  it('supports a different heading level, centring and a frame', () => {
    const { container } = render(
      <EmptyState title="Quiet so far" titleAs="h2" align="center" framed />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute('data-align', 'center')
    expect(container.firstElementChild).toHaveAttribute('data-framed')
  })
})
