import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Field } from '#components/inputs/Field'
import { Select } from './Select'

const categories = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'legal', label: 'Legal', disabled: true },
  { value: 'support', label: 'Support' },
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
    expect(screen.getByRole('option', { name: 'Legal' })).toHaveAttribute('data-disabled')
    await userEvent.click(screen.getByRole('option', { name: 'Engineering' }))
    expect(onValueChange).toHaveBeenCalledWith('engineering')
    expect(screen.getByRole('combobox')).toHaveTextContent('Engineering')
  })

  it('is keyboard operable: open, move, choose', async () => {
    const onValueChange = vi.fn()
    render(
      <Select
        aria-label="Category"
        options={categories}
        defaultValue="design"
        onValueChange={onValueChange}
      />,
    )
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('engineering')
    expect(trigger).toHaveTextContent('Engineering')
  })

  it('renders groups with labels', async () => {
    render(
      <Select
        aria-label="Country"
        groups={[
          { label: 'Americas', options: [{ value: 'mex', label: 'Mexico' }] },
          {
            label: 'Asia-Pacific',
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
    expect(screen.getByText('Asia-Pacific')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Australia' })).toBeInTheDocument()
  })

  it('picks up label, description and error from a Field', () => {
    render(
      <Field label="Category" description="Used for the weekly report" error="Choose a category">
        <Select options={categories} placeholder="Choose" />
      </Field>,
    )
    const trigger = screen.getByLabelText('Category')
    expect(trigger).toHaveRole('combobox')
    expect(trigger).toHaveAccessibleDescription('Used for the weekly report Choose a category')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAttribute('data-invalid')
  })

  it('supports the compound API', async () => {
    render(
      <Select.Root defaultValue="fr">
        <Select.Trigger aria-label="Country" />
        <Select.Content>
          <Select.Group>
            <Select.Label>Europe</Select.Label>
            <Select.Item value="fr">France</Select.Item>
            <Select.Item value="es">Spain</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>,
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('France')
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Spain' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('Spain')
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
        value="design"
        onValueChange={onValueChange}
        readOnly
      />,
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('option', { name: 'Engineering' }))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(trigger).toHaveTextContent('Design')
  })
})
