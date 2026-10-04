import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fieldset } from '#components/inputs/Fieldset'
import { CheckboxGroup } from './CheckboxGroup'

const topics = [
  { value: 'goals', label: 'Goals', description: 'When anyone you drew scores' },
  { value: 'kickoffs', label: 'Kick-offs' },
  { value: 'results', label: 'Final results' },
]

describe('CheckboxGroup', () => {
  it('is a labelled group of checkboxes with descriptions', () => {
    render(<CheckboxGroup aria-label="Notify me about" options={topics} defaultValue={['goals']} />)
    expect(screen.getByRole('group', { name: 'Notify me about' })).toBeInTheDocument()
    const goals = screen.getByRole('checkbox', { name: 'Goals' })
    expect(goals).toBeChecked()
    expect(goals).toHaveAccessibleDescription('When anyone you drew scores')
    expect(screen.getByRole('checkbox', { name: 'Kick-offs' })).not.toBeChecked()
  })

  it('toggles uncontrolled, keeping option order', async () => {
    const onValueChange = vi.fn()
    render(
      <CheckboxGroup
        aria-label="Notify me about"
        options={topics}
        defaultValue={['results']}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByText('Goals'))
    expect(onValueChange).toHaveBeenLastCalledWith(['goals', 'results'])
    expect(screen.getByRole('checkbox', { name: 'Goals' })).toBeChecked()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Final results' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['goals'])
  })

  it('is controlled by value', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <CheckboxGroup
        aria-label="Notify me about"
        options={topics}
        value={[]}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Goals' }))
    expect(onValueChange).toHaveBeenCalledWith(['goals'])
    expect(screen.getByRole('checkbox', { name: 'Goals' })).not.toBeChecked()
    rerender(
      <CheckboxGroup
        aria-label="Notify me about"
        options={topics}
        value={['goals']}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('checkbox', { name: 'Goals' })).toBeChecked()
  })

  it('each box is a tab stop and Space toggles it', async () => {
    render(<CheckboxGroup aria-label="Notify me about" options={topics} />)
    await userEvent.tab()
    expect(screen.getByRole('checkbox', { name: 'Goals' })).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(screen.getByRole('checkbox', { name: 'Goals' })).toBeChecked()
    await userEvent.tab()
    expect(screen.getByRole('checkbox', { name: 'Kick-offs' })).toHaveFocus()
  })

  it('select all is tri-state and skips disabled options', async () => {
    const options = [...topics, { value: 'draws', label: 'Draws', disabled: true }]
    render(
      <CheckboxGroup aria-label="Notify me about" options={options} selectAllLabel="Everything" />,
    )
    const all = screen.getByRole('checkbox', { name: 'Everything' })
    expect(all).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Goals' }))
    expect(all).toHaveAttribute('aria-checked', 'mixed')
    await userEvent.click(all)
    expect(all).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('checkbox', { name: 'Final results' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Draws' })).not.toBeChecked()
    await userEvent.click(all)
    expect(all).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('checkbox', { name: 'Goals' })).not.toBeChecked()
  })

  it('emits one hidden input per checked value', () => {
    const { container } = render(
      <form>
        <CheckboxGroup
          aria-label="Notify me about"
          name="notify"
          options={topics}
          defaultValue={['goals', 'results']}
        />
      </form>,
    )
    const form = container.querySelector('form')
    if (!form) throw new Error('no form')
    expect(new FormData(form).getAll('notify')).toEqual(['goals', 'results'])
  })

  it('accepts Item children', async () => {
    render(
      <CheckboxGroup aria-label="Notify me about" selectAllLabel="Everything">
        <CheckboxGroup.Item value="goals" label="Goals" />
        <CheckboxGroup.Item value="kickoffs" label="Kick-offs" />
      </CheckboxGroup>,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Everything' }))
    expect(screen.getByRole('checkbox', { name: 'Goals' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Kick-offs' })).toBeChecked()
  })

  it('readOnly keeps the boxes focusable but ignores clicks', async () => {
    const onValueChange = vi.fn()
    render(
      <CheckboxGroup
        aria-label="Notify me about"
        options={topics}
        defaultValue={['goals']}
        readOnly
        onValueChange={onValueChange}
      />,
    )
    const kickoffs = screen.getByRole('checkbox', { name: 'Kick-offs' })
    expect(kickoffs).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(kickoffs)
    expect(kickoffs).not.toBeChecked()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('group')).toHaveAttribute('data-readonly')
  })

  it('disabled disables every box', () => {
    render(<CheckboxGroup aria-label="Notify me about" options={topics} disabled />)
    for (const box of screen.getAllByRole('checkbox')) expect(box).toBeDisabled()
  })

  it('fires onBlur only when focus leaves the group', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <CheckboxGroup aria-label="Notify me about" options={topics} onBlur={onBlur} />
        <button type="button">Save</button>
      </>,
    )
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('is labelled and marked invalid by a surrounding Fieldset', () => {
    render(
      <Fieldset legend="Notify me about" error="Choose at least one">
        <CheckboxGroup options={topics} />
      </Fieldset>,
    )
    // Only the fieldset carries the legend's name; the group inside doesn't repeat it.
    expect(screen.getAllByRole('group', { name: 'Notify me about' })).toHaveLength(1)
    const group = screen.getAllByRole('group').find((el) => el.tagName === 'DIV')
    expect(group).not.toHaveAttribute('aria-labelledby')
    expect(group).toHaveAttribute('aria-invalid', 'true')
    // The options don't inherit the fieldset's wiring.
    expect(screen.getByRole('checkbox', { name: 'Kick-offs' })).not.toHaveAttribute('aria-invalid')
  })

  it('maps columns to responsive vars and forwards the ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <CheckboxGroup
        ref={ref}
        aria-label="Notify me about"
        options={topics}
        columns={{ base: 1, md: 3 }}
      />,
    )
    const group = screen.getByRole('group')
    expect(ref.current).toBe(group)
    expect(group.style.getPropertyValue('--checkbox-group-columns-base')).toBe(
      'repeat(1, minmax(0, 1fr))',
    )
    expect(group.style.getPropertyValue('--checkbox-group-columns-md')).toBe(
      'repeat(3, minmax(0, 1fr))',
    )
  })
})
