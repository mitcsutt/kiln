import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChipGroupField } from './ChipGroupField'

const alerts = [
  { value: 'goals', label: 'Goals' },
  { value: 'full-time', label: 'Full time' },
]

describe('ChipGroupField', () => {
  it('renders the chips under a fieldset legend with help and error', () => {
    render(
      <ChipGroupField
        type="multiple"
        label="Alerts"
        description="Sent to your phone"
        error="Pick at least one"
        options={alerts}
      />,
    )
    const fieldset = screen
      .getAllByRole('group', { name: 'Alerts' })
      .find((el) => el.tagName === 'FIELDSET')
    expect(fieldset).toHaveAccessibleDescription('Sent to your phone Pick at least one')
  })

  it('single: value and onValueChange carry a string', async () => {
    const onValueChange = vi.fn()
    render(
      <ChipGroupField
        type="single"
        label="Alert"
        options={alerts}
        defaultValue="full-time"
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('radio', { name: 'Full time' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'Goals' }))
    expect(onValueChange).toHaveBeenCalledWith('goals')
  })

  it('multiple: forwards ref and id to the group, className to the fieldset', async () => {
    const ref = createRef<HTMLDivElement>()
    const onValueChange = vi.fn()
    const { container } = render(
      <ChipGroupField
        ref={ref}
        id="alerts"
        className="extra"
        type="multiple"
        label="Alerts"
        options={alerts}
        onValueChange={onValueChange}
      />,
    )
    expect(ref.current).toHaveAttribute('id', 'alerts')
    expect(container.querySelector('fieldset')).toHaveClass('extra')
    await userEvent.click(screen.getByRole('button', { name: 'Full time' }))
    expect(onValueChange).toHaveBeenCalledWith(['full-time'])
  })

  it('readOnly from the field holds the value', async () => {
    render(<ChipGroupField type="multiple" label="Alerts" options={alerts} readOnly />)
    await userEvent.click(screen.getByRole('button', { name: 'Full time' }))
    expect(screen.getByRole('button', { name: 'Full time' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
