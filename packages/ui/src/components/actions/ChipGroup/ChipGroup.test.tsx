import { createRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fieldset } from '#components/inputs/Fieldset'
import { ChipGroup } from './ChipGroup'

const alerts = [
  { value: 'mentions', label: 'Mentions', count: 4 },
  { value: 'comments', label: 'Comments', description: 'Sent once a day' },
  { value: 'deploys', label: 'Deploys' },
]

describe('ChipGroup', () => {
  it('multiple: a group of toggle buttons, pressed by click', async () => {
    const onValueChange = vi.fn()
    render(
      <ChipGroup
        type="multiple"
        aria-label="Email alerts"
        options={alerts}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('group', { name: 'Email alerts' })).toBeInTheDocument()
    const deploys = screen.getByRole('button', { name: 'Deploys' })
    await userEvent.click(deploys)
    await userEvent.click(screen.getByRole('button', { name: 'Mentions 4' }))
    expect(deploys).toHaveAttribute('aria-pressed', 'true')
    // Option order, not click order.
    expect(onValueChange).toHaveBeenLastCalledWith(['mentions', 'deploys'])
    expect(screen.getByRole('button', { name: 'Comments' })).toHaveAccessibleDescription(
      'Sent once a day',
    )
  })

  it('single: a radiogroup; arrow keys move, Space selects; pressing again clears', async () => {
    const onValueChange = vi.fn()
    render(
      <ChipGroup
        type="single"
        aria-label="Email alert"
        options={alerts}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Email alert' })).toBeInTheDocument()
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Mentions 4' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Comments' })).toHaveFocus())
    await userEvent.keyboard(' ')
    expect(onValueChange).toHaveBeenLastCalledWith('comments')
    expect(screen.getByRole('radio', { name: 'Comments' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard(' ')
    expect(onValueChange).toHaveBeenLastCalledWith('')
  })

  it('is controlled by value', async () => {
    const onValueChange = vi.fn()
    render(
      <ChipGroup
        type="multiple"
        aria-label="Email alerts"
        options={alerts}
        value={['deploys']}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Deploys' }))
    expect(onValueChange).toHaveBeenCalledWith([])
    expect(screen.getByRole('button', { name: 'Deploys' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('readOnly ignores presses; disabled disables every chip', async () => {
    const { rerender } = render(
      <ChipGroup type="multiple" aria-label="Email alerts" options={alerts} readOnly />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Deploys' }))
    expect(screen.getByRole('button', { name: 'Deploys' })).toHaveAttribute('aria-pressed', 'false')
    rerender(<ChipGroup type="multiple" aria-label="Email alerts" options={alerts} disabled />)
    for (const chip of screen.getAllByRole('button')) expect(chip).toBeDisabled()
  })

  it('emits a hidden input per pressed chip', () => {
    const { container } = render(
      <form>
        <ChipGroup
          type="multiple"
          aria-label="Email alerts"
          name="alerts"
          options={alerts}
          defaultValue={['mentions', 'deploys']}
        />
      </form>,
    )
    const form = container.querySelector('form')
    if (!form) throw new Error('no form')
    expect(new FormData(form).getAll('alerts')).toEqual(['mentions', 'deploys'])
  })

  it('takes its name and invalid state from a Fieldset; forwards the ref; onBlur on leaving', async () => {
    const ref = createRef<HTMLDivElement>()
    const onBlur = vi.fn()
    render(
      <>
        <Fieldset legend="Email alerts" error="Pick at least one">
          <ChipGroup ref={ref} type="multiple" options={alerts} onBlur={onBlur} />
        </Fieldset>
        <button type="button">Save</button>
      </>,
    )
    expect(ref.current).toHaveAttribute('aria-invalid', 'true')
    // The fieldset's legend names the set; the inner group doesn't repeat it.
    expect(screen.getByRole('group', { name: 'Email alerts' })).toContainElement(ref.current)
    expect(ref.current).not.toHaveAttribute('aria-labelledby')
    expect(screen.getByRole('button', { name: 'Deploys' })).toHaveAttribute('data-invalid')
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
