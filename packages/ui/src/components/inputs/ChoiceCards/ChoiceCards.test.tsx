import { createRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fieldset } from '#components/inputs/Fieldset'
import { ChoiceCards } from './ChoiceCards'

const plans = [
  { value: '5', label: '£5', description: 'One project, email support', meta: '£60 a year' },
  {
    value: '10',
    label: '£10',
    description: 'Five projects, priority support',
    meta: '£120 a year',
  },
  {
    value: '20',
    label: '£20',
    description: 'Unlimited projects, a named contact',
    meta: '£240 a year',
    disabled: true,
  },
]

describe('ChoiceCards', () => {
  it('single: cards are radios named by their label and described by description + meta', () => {
    render(<ChoiceCards type="single" aria-label="Plan" options={plans} defaultValue="10" />)
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument()
    const ten = screen.getByRole('radio', { name: '£10' })
    expect(ten).toHaveAttribute('aria-checked', 'true')
    expect(ten).toHaveAccessibleDescription('Five projects, priority support £120 a year')
    expect(screen.getByRole('radio', { name: '£20' })).toBeDisabled()
  })

  it('single: arrow keys move and select; one tab stop', async () => {
    const onValueChange = vi.fn()
    render(
      <ChoiceCards
        type="single"
        aria-label="Plan"
        options={plans}
        defaultValue="5"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: '£5' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight>}')
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: '£10' })).toHaveAttribute('aria-checked', 'true'),
    )
    await userEvent.keyboard('{/ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith('10')
  })

  it('single: the whole card is the hit target; controlled', async () => {
    const onValueChange = vi.fn()
    render(
      <ChoiceCards
        type="single"
        aria-label="Plan"
        options={plans}
        value="5"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByText('£120 a year'))
    expect(onValueChange).toHaveBeenCalledWith('10')
    expect(screen.getByRole('radio', { name: '£5' })).toHaveAttribute('aria-checked', 'true')
  })

  it('multiple: cards are checkboxes in a group; each a tab stop; Space toggles', async () => {
    const onValueChange = vi.fn()
    render(
      <ChoiceCards
        type="multiple"
        aria-label="Plans"
        options={plans}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('group', { name: 'Plans' })).toBeInTheDocument()
    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('checkbox', { name: '£10' })).toHaveFocus()
    await userEvent.keyboard(' ')
    await userEvent.click(screen.getByRole('checkbox', { name: '£5' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['5', '10'])
    expect(screen.getByRole('checkbox', { name: '£5' })).toBeChecked()
  })

  it('emits hidden inputs for the selected values', () => {
    const { container } = render(
      <form>
        <ChoiceCards
          type="multiple"
          aria-label="Plans"
          name="plan"
          options={plans}
          defaultValue={['5', '10']}
        />
        <ChoiceCards
          type="single"
          aria-label="Plan"
          name="single"
          options={plans}
          defaultValue="5"
        />
      </form>,
    )
    const form = container.querySelector('form')
    if (!form) throw new Error('no form')
    expect(new FormData(form).getAll('plan')).toEqual(['5', '10'])
    expect(new FormData(form).getAll('single')).toEqual(['5'])
  })

  it('readOnly ignores changes in both modes', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <ChoiceCards
        type="single"
        aria-label="Plan"
        options={plans}
        defaultValue="5"
        readOnly
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(screen.getByRole('radio', { name: '£10' }))
    expect(screen.getByRole('radio', { name: '£5' })).toHaveAttribute('aria-checked', 'true')
    rerender(
      <ChoiceCards
        type="multiple"
        aria-label="Plans"
        options={plans}
        readOnly
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: '£10' }))
    expect(screen.getByRole('checkbox', { name: '£10' })).not.toBeChecked()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('disabled disables every card', () => {
    render(<ChoiceCards type="multiple" aria-label="Plans" options={plans} disabled />)
    for (const card of screen.getAllByRole('checkbox')) expect(card).toBeDisabled()
  })

  it('takes invalid from a Fieldset, maps columns, forwards the ref, blurs on leaving', async () => {
    const ref = createRef<HTMLDivElement>()
    const onBlur = vi.fn()
    render(
      <>
        <Fieldset legend="Plan" error="Choose a plan">
          <ChoiceCards
            ref={ref}
            type="multiple"
            options={plans}
            columns={{ base: 1, sm: 3 }}
            onBlur={onBlur}
          />
        </Fieldset>
        <button type="button">Join</button>
      </>,
    )
    const group = ref.current
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAttribute('data-columns')
    expect(group?.style.getPropertyValue('--choice-cards-columns-sm')).toBe(
      'repeat(3, minmax(0, 1fr))',
    )
    await userEvent.tab()
    await userEvent.tab()
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Join' })).toHaveFocus()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
