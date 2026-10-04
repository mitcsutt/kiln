import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectField, type SelectOption } from './index'

const roles: SelectOption[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]

describe('SelectField', () => {
  it('labels the combobox and shows the placeholder', () => {
    render(<SelectField label="Role" options={roles} placeholder="Pick one" />)
    const trigger = screen.getByRole('combobox', { name: 'Role' })
    expect(trigger).toHaveTextContent('Pick one')
  })

  it('selects a value and calls onValueChange / onBlur', async () => {
    const onValueChange = vi.fn()
    const onBlur = vi.fn()
    render(
      <SelectField label="Role" options={roles} onValueChange={onValueChange} onBlur={onBlur} />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'User' }))
    expect(onValueChange).toHaveBeenCalledWith('user')
    screen.getByRole('combobox').focus()
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalled()
  })

  it('renders error, required and disabled', () => {
    render(<SelectField label="Role" options={roles} error="Required" required disabled />)
    const trigger = screen.getByRole('combobox')
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    expect(trigger).toHaveAttribute('aria-required', 'true')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toBeDisabled()
  })
})
