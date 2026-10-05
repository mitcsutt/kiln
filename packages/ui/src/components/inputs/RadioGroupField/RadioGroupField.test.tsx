import { createRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadioGroupField } from './RadioGroupField'

const periods = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly', description: 'Every second Thursday' },
  { value: 'monthly', label: 'Monthly' },
]

describe('RadioGroupField', () => {
  it('renders a radiogroup inside a fieldset named by the legend (once), with option descriptions', () => {
    render(
      <RadioGroupField label="Billing period" options={periods} defaultValue="monthly" required />,
    )
    const fieldset = screen.getByRole('group', { name: 'Billing period' })
    const group = screen.getByRole('radiogroup')
    expect(fieldset).toContainElement(group)
    // The legend already names the fieldset: the radiogroup doesn't repeat it.
    expect(group).not.toHaveAttribute('aria-labelledby')
    expect(group).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Fortnightly' })).toHaveAccessibleDescription(
      'Every second Thursday',
    )
  })

  it('arrow keys move and select; uncontrolled', async () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroupField
        label="Billing period"
        options={periods}
        defaultValue="weekly"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Weekly' })).toHaveFocus()
    // Hold the key: Radix selects on the focus that follows an arrow press, after a tick.
    await userEvent.keyboard('{ArrowDown>}')
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Fortnightly' })).toBeChecked())
    await userEvent.keyboard('{/ArrowDown}')
    expect(onValueChange).toHaveBeenLastCalledWith('fortnightly')
  })

  it('is controlled by value', async () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroupField
        label="Billing period"
        options={periods}
        value="weekly"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByText('Monthly'))
    expect(onValueChange).toHaveBeenCalledWith('monthly')
    expect(screen.getByRole('radio', { name: 'Weekly' })).toBeChecked()
  })

  it('readOnly holds an uncontrolled value', async () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroupField
        label="Billing period"
        options={periods}
        defaultValue="weekly"
        readOnly
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(screen.getByText('Monthly'))
    expect(screen.getByRole('radio', { name: 'Weekly' })).toBeChecked()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('submits the checked value under name; forwards ref; error marks the group invalid', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <form>
        <RadioGroupField
          ref={ref}
          label="Billing period"
          name="period"
          options={periods}
          defaultValue="monthly"
          error="Pick one"
        />
      </form>,
    )
    const form = container.querySelector('form')
    if (!form) throw new Error('no form')
    expect(new FormData(form).get('period')).toBe('monthly')
    expect(ref.current).toBe(screen.getByRole('radiogroup'))
    expect(ref.current).toHaveAttribute('aria-invalid', 'true')
  })

  it('fires onBlur when focus leaves the group', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <RadioGroupField
          label="Billing period"
          options={periods}
          defaultValue="weekly"
          onBlur={onBlur}
        />
        <button type="button">Next</button>
      </>,
    )
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('passes layout to the fieldset', () => {
    render(<RadioGroupField label="Billing period" options={periods} layout="horizontal" />)
    expect(screen.getByRole('group', { name: 'Billing period' })).toHaveAttribute(
      'data-layout',
      'horizontal',
    )
  })
})
