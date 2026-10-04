import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from '#components/inputs/Field'
import { Fieldset } from '#components/inputs/Fieldset'
import { RadioGroup } from './RadioGroup'

function PlanPicker(props: {
  onValueChange?: (v: string) => void
  invalid?: boolean
  readOnly?: boolean
}) {
  return (
    <RadioGroup aria-label="Plan" defaultValue="20" {...props}>
      <RadioGroup.Item value="10" label="$10" />
      <RadioGroup.Item value="20" label="$20" description="Most people pick this" />
      <RadioGroup.Item value="50" label="$50" disabled />
    </RadioGroup>
  )
}

describe('RadioGroup', () => {
  it('renders labelled radios with one checked', () => {
    render(<PlanPicker />)
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '$20' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '$20' })).toHaveAccessibleDescription(
      'Most people pick this',
    )
    expect(screen.getByRole('radio', { name: '$50' })).toBeDisabled()
  })

  it('selects by click and by label', async () => {
    const onValueChange = vi.fn()
    render(<PlanPicker onValueChange={onValueChange} />)
    await userEvent.click(screen.getByText('$10'))
    expect(onValueChange).toHaveBeenCalledWith('10')
    expect(screen.getByRole('radio', { name: '$10' })).toBeChecked()
  })

  it('is one tab stop; arrow keys move between options', async () => {
    render(<PlanPicker />)
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: '$20' })).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => expect(screen.getByRole('radio', { name: '$10' })).toHaveFocus())
  })

  it('sets orientation and invalid for styling', () => {
    render(
      <RadioGroup aria-label="Period" orientation="horizontal" invalid>
        <RadioGroup.Item value="w" label="Weekly" />
      </RadioGroup>,
    )
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('data-orientation', 'horizontal')
    expect(group).toHaveAttribute('aria-invalid', 'true')
  })

  it('readOnly sets aria-readonly and ignores selection changes', async () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup aria-label="Plan" value="20" onValueChange={onValueChange} readOnly>
        <RadioGroup.Item value="10" label="$10" />
        <RadioGroup.Item value="20" label="$20" />
      </RadioGroup>,
    )
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(screen.getByText('$10'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: '$20' })).toBeChecked()
  })

  it('is labelled by a surrounding Field label', () => {
    render(
      <Field label="Pay period" error="Choose a period">
        <RadioGroup>
          <RadioGroup.Item value="w" label="Weekly" />
          <RadioGroup.Item value="m" label="Monthly" />
        </RadioGroup>
      </Field>,
    )
    const group = screen.getByRole('radiogroup', { name: 'Pay period' })
    expect(group).toHaveAccessibleDescription('Choose a period')
    expect(group).not.toHaveAttribute('id')
  })

  it('inside a Fieldset, leaves the name to the legend (named once)', () => {
    render(
      <Fieldset legend="Pay period">
        <RadioGroup>
          <RadioGroup.Item value="w" label="Weekly" />
        </RadioGroup>
      </Fieldset>,
    )
    expect(screen.getByRole('group', { name: 'Pay period' })).toContainElement(
      screen.getByRole('radiogroup'),
    )
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-labelledby')
  })
})
