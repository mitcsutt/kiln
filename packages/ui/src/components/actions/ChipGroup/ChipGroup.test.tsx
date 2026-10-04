import { createRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fieldset } from '#components/inputs/Fieldset'
import { ChipGroup } from './ChipGroup'

const alerts = [
  { value: 'goals', label: 'Goals', count: 4 },
  { value: 'first-red', label: 'Red cards', description: 'Sent at full time' },
  { value: 'own-goal', label: 'Own goal' },
]

describe('ChipGroup', () => {
  it('multiple: a group of toggle buttons, pressed by click', async () => {
    const onValueChange = vi.fn()
    render(
      <ChipGroup
        type="multiple"
        aria-label="Match alerts"
        options={alerts}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('group', { name: 'Match alerts' })).toBeInTheDocument()
    const ownGoal = screen.getByRole('button', { name: 'Own goal' })
    await userEvent.click(ownGoal)
    await userEvent.click(screen.getByRole('button', { name: 'Goals 4' }))
    expect(ownGoal).toHaveAttribute('aria-pressed', 'true')
    // Option order, not click order.
    expect(onValueChange).toHaveBeenLastCalledWith(['goals', 'own-goal'])
    expect(screen.getByRole('button', { name: 'Red cards' })).toHaveAccessibleDescription(
      'Sent at full time',
    )
  })

  it('single: a radiogroup; arrow keys move, Space selects; pressing again clears', async () => {
    const onValueChange = vi.fn()
    render(
      <ChipGroup
        type="single"
        aria-label="Match alert"
        options={alerts}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Match alert' })).toBeInTheDocument()
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Goals 4' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Red cards' })).toHaveFocus())
    await userEvent.keyboard(' ')
    expect(onValueChange).toHaveBeenLastCalledWith('first-red')
    expect(screen.getByRole('radio', { name: 'Red cards' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard(' ')
    expect(onValueChange).toHaveBeenLastCalledWith('')
  })

  it('is controlled by value', async () => {
    const onValueChange = vi.fn()
    render(
      <ChipGroup
        type="multiple"
        aria-label="Match alerts"
        options={alerts}
        value={['own-goal']}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Own goal' }))
    expect(onValueChange).toHaveBeenCalledWith([])
    expect(screen.getByRole('button', { name: 'Own goal' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('readOnly ignores presses; disabled disables every chip', async () => {
    const { rerender } = render(
      <ChipGroup type="multiple" aria-label="Match alerts" options={alerts} readOnly />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Own goal' }))
    expect(screen.getByRole('button', { name: 'Own goal' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    rerender(<ChipGroup type="multiple" aria-label="Match alerts" options={alerts} disabled />)
    for (const chip of screen.getAllByRole('button')) expect(chip).toBeDisabled()
  })

  it('emits a hidden input per pressed chip', () => {
    const { container } = render(
      <form>
        <ChipGroup
          type="multiple"
          aria-label="Match alerts"
          name="alerts"
          options={alerts}
          defaultValue={['goals', 'own-goal']}
        />
      </form>,
    )
    const form = container.querySelector('form')
    if (!form) throw new Error('no form')
    expect(new FormData(form).getAll('alerts')).toEqual(['goals', 'own-goal'])
  })

  it('takes its name and invalid state from a Fieldset; forwards the ref; onBlur on leaving', async () => {
    const ref = createRef<HTMLDivElement>()
    const onBlur = vi.fn()
    render(
      <>
        <Fieldset legend="Match alerts" error="Pick at least one">
          <ChipGroup ref={ref} type="multiple" options={alerts} onBlur={onBlur} />
        </Fieldset>
        <button type="button">Save</button>
      </>,
    )
    expect(ref.current).toHaveAttribute('aria-invalid', 'true')
    // The fieldset's legend names the set; the inner group doesn't repeat it (QA-A11Y-3).
    expect(screen.getByRole('group', { name: 'Match alerts' })).toContainElement(ref.current)
    expect(ref.current).not.toHaveAttribute('aria-labelledby')
    expect(screen.getByRole('button', { name: 'Own goal' })).toHaveAttribute('data-invalid')
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
