import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Field } from '#components/inputs/Field'
import { Select } from './Select'

const categories = [
  { value: 'groceries', label: 'Groceries' },
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities', disabled: true },
  { value: 'transport', label: 'Transport' },
]

describe('Select', () => {
  it('renders a combobox with the placeholder and forwards the ref', () => {
    const ref = createRef<HTMLButtonElement>()
    render(
      <Select
        ref={ref}
        aria-label="Category"
        options={categories}
        placeholder="Choose a category"
      />,
    )
    const trigger = screen.getByRole('combobox', { name: 'Category' })
    expect(ref.current).toBe(trigger)
    expect(trigger).toHaveTextContent('Choose a category')
    expect(trigger).toHaveAttribute('data-placeholder')
  })

  it('opens with the mouse and selects an option', async () => {
    const onValueChange = vi.fn()
    render(<Select aria-label="Category" options={categories} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('option', { name: 'Utilities' })).toHaveAttribute('data-disabled')
    await userEvent.click(screen.getByRole('option', { name: 'Rent' }))
    expect(onValueChange).toHaveBeenCalledWith('rent')
    expect(screen.getByRole('combobox')).toHaveTextContent('Rent')
  })

  it('is keyboard operable: open, move, choose', async () => {
    const onValueChange = vi.fn()
    render(
      <Select
        aria-label="Category"
        options={categories}
        defaultValue="groceries"
        onValueChange={onValueChange}
      />,
    )
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('rent')
    expect(trigger).toHaveTextContent('Rent')
  })

  it('renders groups with labels', async () => {
    render(
      <Select
        aria-label="Team"
        groups={[
          { label: 'Group A', options: [{ value: 'mex', label: 'Mexico' }] },
          {
            label: 'Group D',
            options: [
              { value: 'usa', label: 'United States' },
              { value: 'aus', label: 'Australia' },
            ],
          },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getAllByRole('group')).toHaveLength(2)
    expect(screen.getByText('Group D')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Australia' })).toBeInTheDocument()
  })

  it('picks up label, description and error from a Field', () => {
    render(
      <Field label="Category" description="Used for the monthly report" error="Choose a category">
        <Select options={categories} placeholder="Choose" />
      </Field>,
    )
    const trigger = screen.getByLabelText('Category')
    expect(trigger).toHaveRole('combobox')
    expect(trigger).toHaveAccessibleDescription('Used for the monthly report Choose a category')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAttribute('data-invalid')
  })

  it('supports the compound API', async () => {
    render(
      <Select.Root defaultValue="fr">
        <Select.Trigger aria-label="Team" />
        <Select.Content>
          <Select.Group>
            <Select.Label>Group I</Select.Label>
            <Select.Item value="fr">France</Select.Item>
            <Select.Item value="sn">Senegal</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>,
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('France')
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Senegal' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('Senegal')
  })

  it('does not open when disabled', async () => {
    render(<Select aria-label="Category" options={categories} disabled />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('readOnly sets aria-readonly and ignores value changes', async () => {
    const onValueChange = vi.fn()
    render(
      <Select
        aria-label="Category"
        options={categories}
        value="groceries"
        onValueChange={onValueChange}
        readOnly
      />,
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('option', { name: 'Rent' }))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(trigger).toHaveTextContent('Groceries')
  })
})
