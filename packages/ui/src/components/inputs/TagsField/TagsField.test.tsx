import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { TagsField } from './TagsField'

describe('TagsField', () => {
  it('labels the input and forwards the ref, id and className', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(
      <TagsField ref={ref} id="labels" label="Labels" className="extra" />,
    )
    const input = screen.getByRole('textbox', { name: 'Labels' })
    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute('id', 'labels')
    expect(container.firstElementChild).toHaveClass('extra')
  })

  it('wires description, warning, error and merges aria-describedby', () => {
    const { rerender } = render(
      <>
        <p id="extra">Visible to your team</p>
        <TagsField
          label="Labels"
          description="Press Enter to add"
          warning="Labels are shared"
          aria-describedby="extra"
        />
      </>,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAccessibleDescription(
      /Press Enter to add.*Labels are shared.*Visible to your team/,
    )
    rerender(
      <>
        <p id="extra">Visible to your team</p>
        <TagsField label="Labels" error="Add at least one label" aria-describedby="extra" />
      </>,
    )
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Add at least one label')
  })

  it('passes required, readOnly, disabled and validating through the Field', () => {
    const { rerender } = render(
      <TagsField label="Labels" required readOnly validating defaultValue={['Rent']} />,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('button', { name: 'Remove Rent' })).not.toBeInTheDocument()
    rerender(<TagsField label="Labels" disabled />)
    expect(input).toBeDisabled()
  })

  it('value / onValueChange are string[], with onReject and name', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    const { container } = render(
      <TagsField
        label="Labels"
        name="labels"
        defaultValue={['Rent']}
        onValueChange={onValueChange}
        onReject={onReject}
      />,
    )
    await user.type(screen.getByRole('textbox'), 'Fuel{Enter}rent{Enter}')
    expect(onValueChange).toHaveBeenNthCalledWith(1, ['Rent', 'Fuel'])
    // Duplicates compare the normalised text exactly: 'rent' is a different tag.
    expect(onValueChange).toHaveBeenLastCalledWith(['Rent', 'Fuel', 'rent'])
    expect(onReject).not.toHaveBeenCalled()
    await user.type(screen.getByRole('textbox'), 'Rent{Enter}')
    expect(onReject).toHaveBeenCalledWith('Rent', 'duplicate')
    expect(
      [...container.querySelectorAll<HTMLInputElement>('input[name="labels"]')].map(
        (input) => input.value,
      ),
    ).toEqual(['Rent', 'Fuel', 'rent'])
  })

  it('onBlur fires when focus leaves the whole control', async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(
      <>
        <TagsField label="Labels" defaultValue={['Rent']} onBlur={onBlur} />
        <button type="button">Next</button>
      </>,
    )
    await user.click(screen.getByRole('textbox'))
    await user.tab({ shift: true })
    expect(onBlur).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
