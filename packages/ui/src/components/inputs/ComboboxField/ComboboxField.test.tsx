import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import type { ComboboxOption } from '#components/inputs/Combobox'
import { ComboboxField } from './ComboboxField'

const teams: ComboboxOption[] = [
  { value: 'arg', label: 'Argentina' },
  { value: 'bra', label: 'Brazil' },
  { value: 'mex', label: 'Mexico' },
]

describe('ComboboxField', () => {
  it('labels the combobox and forwards the ref, id and className', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(
      <ComboboxField ref={ref} id="team" label="Team" options={teams} className="extra" />,
    )
    const input = screen.getByRole('combobox', { name: 'Team' })
    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute('id', 'team')
    expect(container.firstElementChild).toHaveClass('extra')
  })

  it('wires description, warning and error, merging aria-describedby', () => {
    const { rerender } = render(
      <>
        <p id="extra">Shown on your profile</p>
        <ComboboxField
          label="Team"
          description="The side you follow"
          warning="Fixtures not published yet"
          options={teams}
          aria-describedby="extra"
        />
      </>,
    )
    const input = screen.getByRole('combobox')
    expect(input).toHaveAccessibleDescription(
      /The side you follow.*Fixtures not published yet.*Shown on your profile/,
    )
    rerender(
      <>
        <p id="extra">Shown on your profile</p>
        <ComboboxField
          label="Team"
          error="Choose a team"
          options={teams}
          aria-describedby="extra"
        />
      </>,
    )
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/Choose a team/)
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a team')
  })

  it('passes required, readOnly, disabled and validating through the Field', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <ComboboxField label="Team" options={teams} required readOnly validating />,
    )
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveAttribute('aria-busy', 'true')
    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'false')
    rerender(<ComboboxField label="Team" options={teams} disabled />)
    expect(input).toBeDisabled()
  })

  it('single: value / onValueChange with string | null and a hidden input for name', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(
      <ComboboxField
        label="Team"
        name="team"
        options={teams}
        defaultValue="arg"
        clearable
        onValueChange={onValueChange}
      />,
    )
    expect(container.querySelector<HTMLInputElement>('input[name="team"]')?.value).toBe('arg')
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
        label="Teams"
        multiple
        options={teams}
        defaultValue={['mex']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Teams' }))
    await user.keyboard('{Home}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['mex', 'arg'])
  })

  it('onBlur fires when focus leaves the whole control', async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(
      <>
        <ComboboxField label="Team" options={teams} onBlur={onBlur} />
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
    render(<ComboboxField label="Team" options={teams} />)
    await user.click(screen.getByText('Team'))
    expect(screen.getByRole('combobox')).toHaveFocus()
  })
})
