import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { DateField } from './DateField'

describe('DateField', () => {
  it('labels the date group, describes it and wires error and required; ref → box', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <DateField
        ref={ref}
        label="Due date"
        description="Invoices are due within 30 days"
        error="Choose a due date"
        required
      />,
    )
    const group = screen.getByRole('group', { name: /Due date/ })
    expect(ref.current).toBe(group)
    expect(group).toHaveAccessibleDescription(/Invoices are due within 30 days/)
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a due date')
    const day = screen.getByRole('spinbutton', { name: 'Day' })
    expect(day).toHaveAttribute('aria-invalid', 'true')
    expect(day).toHaveAttribute('aria-required', 'true')
  })

  it('passes input props through and disables the parts', () => {
    render(<DateField label="Due date" defaultValue="2026-10-15" disabled id="due" />)
    const day = screen.getByRole('spinbutton', { name: 'Day' })
    expect(day).toHaveAttribute('id', 'due')
    expect(day).toHaveTextContent('15')
    expect(day).toHaveAttribute('aria-disabled', 'true')
  })
})
