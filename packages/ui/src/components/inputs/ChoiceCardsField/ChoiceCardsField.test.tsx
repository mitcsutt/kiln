import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChoiceCardsField } from './ChoiceCardsField'

const plans = [
  { value: '5', label: '£5' },
  { value: '10', label: '£10' },
]

describe('ChoiceCardsField', () => {
  it('single: a radiogroup inside a fieldset named by the legend (once); value is a string', async () => {
    const onValueChange = vi.fn()
    render(
      <ChoiceCardsField
        type="single"
        label="Plan"
        required
        options={plans}
        onValueChange={onValueChange}
      />,
    )
    const group = screen.getByRole('radiogroup')
    expect(screen.getByRole('group', { name: 'Plan' })).toContainElement(group)
    expect(group).not.toHaveAttribute('aria-labelledby')
    expect(group).toHaveAttribute('aria-required', 'true')
    await userEvent.click(screen.getByRole('radio', { name: '£10' }))
    expect(onValueChange).toHaveBeenCalledWith('10')
  })

  it('multiple: value is an array; error describes the fieldset and marks the group invalid', async () => {
    const ref = createRef<HTMLDivElement>()
    const onValueChange = vi.fn()
    const { container } = render(
      <ChoiceCardsField
        ref={ref}
        type="multiple"
        label="Plans"
        error="Choose one"
        className="extra"
        options={plans}
        onValueChange={onValueChange}
      />,
    )
    expect(container.querySelector('fieldset')).toHaveClass('extra')
    expect(container.querySelector('fieldset')).toHaveAccessibleDescription('Choose one')
    expect(ref.current).toHaveAttribute('aria-invalid', 'true')
    await userEvent.click(screen.getByRole('checkbox', { name: '£5' }))
    expect(onValueChange).toHaveBeenCalledWith(['5'])
  })

  it('readOnly and disabled reach the cards', async () => {
    const { rerender } = render(
      <ChoiceCardsField type="multiple" label="Plans" options={plans} readOnly />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: '£5' }))
    expect(screen.getByRole('checkbox', { name: '£5' })).not.toBeChecked()
    rerender(<ChoiceCardsField type="multiple" label="Plans" options={plans} disabled />)
    expect(screen.getByRole('checkbox', { name: '£5' })).toBeDisabled()
  })
})
