import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckboxGroupField } from './CheckboxGroupField'

const topics = [
  { value: 'goals', label: 'Goals' },
  { value: 'kickoffs', label: 'Kick-offs' },
]

describe('CheckboxGroupField', () => {
  it('renders a fieldset whose legend is the label, with help and error', () => {
    render(
      <CheckboxGroupField
        label="Notify me about"
        description="We only email on match days"
        error="Choose at least one"
        options={topics}
      />,
    )
    const fieldset = screen
      .getAllByRole('group', { name: 'Notify me about' })
      .find((el) => el.tagName === 'FIELDSET')
    expect(fieldset).toHaveAccessibleDescription('We only email on match days Choose at least one')
    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one')
  })

  it('sends ref, id and value props to the group; className to the fieldset', async () => {
    const ref = createRef<HTMLDivElement>()
    const onValueChange = vi.fn()
    const { container } = render(
      <CheckboxGroupField
        ref={ref}
        id="notify"
        className="extra"
        label="Notify me about"
        options={topics}
        onValueChange={onValueChange}
      />,
    )
    expect(ref.current).toHaveAttribute('id', 'notify')
    expect(ref.current).toHaveAttribute('role', 'group')
    expect(container.querySelector('fieldset')).toHaveClass('extra')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Goals' }))
    expect(onValueChange).toHaveBeenCalledWith(['goals'])
  })

  it('readOnly and disabled reach the boxes', async () => {
    const { rerender } = render(
      <CheckboxGroupField label="Notify me about" options={topics} readOnly />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Goals' }))
    expect(screen.getByRole('checkbox', { name: 'Goals' })).not.toBeChecked()
    rerender(<CheckboxGroupField label="Notify me about" options={topics} disabled />)
    expect(screen.getByRole('checkbox', { name: 'Goals' })).toBeDisabled()
  })

  it('labelHidden keeps the legend for assistive tech only', () => {
    render(<CheckboxGroupField label="Notify me about" labelHidden options={topics} />)
    expect(screen.getAllByRole('group', { name: 'Notify me about' })).toHaveLength(1)
    expect(screen.getByText('Notify me about').closest('legend')?.className).toMatch(
      /visuallyHidden/,
    )
  })
})
