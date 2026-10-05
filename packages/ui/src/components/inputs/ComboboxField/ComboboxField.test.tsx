import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import type { ComboboxOption } from '#components/inputs/Combobox'
import { ComboboxField } from './ComboboxField'

const countries: ComboboxOption[] = [
  { value: 'arg', label: 'Argentina' },
  { value: 'bra', label: 'Brazil' },
  { value: 'mex', label: 'Mexico' },
]

describe('ComboboxField', () => {
  it('labels the combobox and forwards the ref, id and className', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(
      <ComboboxField
        ref={ref}
        id="country"
        label="Country"
        options={countries}
        className="extra"
      />,
    )
    const input = screen.getByRole('combobox', { name: 'Country' })
    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute('id', 'country')
    expect(container.firstElementChild).toHaveClass('extra')
  })

  it('wires description, warning and error, merging aria-describedby', () => {
    const { rerender } = render(
      <>
        <p id="extra">Shown on your profile</p>
        <ComboboxField
          label="Country"
          description="Where you are based"
          warning="Tax rates not confirmed yet"
          options={countries}
          aria-describedby="extra"
        />
      </>,
    )
    const input = screen.getByRole('combobox')
    expect(input).toHaveAccessibleDescription(
      /Where you are based.*Tax rates not confirmed yet.*Shown on your profile/,
    )
    rerender(
      <>
        <p id="extra">Shown on your profile</p>
        <ComboboxField
          label="Country"
          error="Choose a country"
          options={countries}
          aria-describedby="extra"
        />
      </>,
    )
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/Choose a country/)
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a country')
  })

  it('passes required, readOnly, disabled and validating through the Field', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <ComboboxField label="Country" options={countries} required readOnly validating />,
    )
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveAttribute('aria-busy', 'true')
    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'false')
    rerender(<ComboboxField label="Country" options={countries} disabled />)
    expect(input).toBeDisabled()
  })

  it('single: value / onValueChange with string | null and a hidden input for name', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(
      <ComboboxField
        label="Country"
        name="country"
        options={countries}
        defaultValue="arg"
        clearable
        onValueChange={onValueChange}
      />,
    )
    expect(container.querySelector<HTMLInputElement>('input[name="country"]')?.value).toBe('arg')
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('bra')
  })

  it('multiple: value / onValueChange with string[]', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ComboboxField
        label="Countries"
        multiple
        options={countries}
        defaultValue={['mex']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Countries' }))
    await user.keyboard('{Home}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['mex', 'arg'])
  })

  it('onBlur fires when focus leaves the whole control', async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(
      <>
        <ComboboxField label="Country" options={countries} onBlur={onBlur} />
        <button type="button">Next</button>
      </>,
    )
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Brazil' }))
    expect(onBlur).not.toHaveBeenCalled()
    await user.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('a label click focuses the input', async () => {
    const user = userEvent.setup()
    render(<ComboboxField label="Country" options={countries} />)
    await user.click(screen.getByText('Country'))
    expect(screen.getByRole('combobox')).toHaveFocus()
  })
})
