import type { ComponentType, ReactNode } from 'react'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormMultiChoiceCardsField } from '#fields/FormMultiChoiceCardsField'
import { fieldsetDescribedByTarget, runFieldConformance, tabOutOfGroup } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

const buyIns: { value: 5 | 10 | 20; label: string }[] = [
  { value: 5, label: '£5' },
  { value: 10, label: '£10' },
  { value: 20, label: '£20' },
]

const labelOf = (value: number) => buyIns.find((b) => b.value === value)?.label ?? ''
const shownLabels = (values: readonly number[]) => values.map(labelOf).join(', ')

const setChecked = async (user: UserEvent, control: HTMLElement, values: readonly number[]) => {
  for (const buyIn of buyIns) {
    const checkbox = within(control).getByRole('checkbox', { name: buyIn.label })
    const shouldBeChecked = values.includes(buyIn.value)
    const isChecked = checkbox.getAttribute('aria-checked') === 'true'
    if (isChecked !== shouldBeChecked) await user.click(checkbox)
  }
}

const displayChecked = (control: HTMLElement) =>
  within(control)
    .getAllByRole('checkbox')
    .filter((checkbox) => checkbox.getAttribute('aria-checked') === 'true')
    .map((checkbox) => checkbox.textContent)
    .join(', ')

// `ChoiceCards` (type="multiple") has no single tab stop (every card is independently
// focusable, unlike the `type="single"` roving-tabindex group) and its error lives on the
// fieldset, not the group `<div>`: `leaveControl` tabs past every card to actually leave the
// group, `describedByTarget` points `blur` at the fieldset, `focusTarget` points the focus
// checks at the first card, and `isDisabled` asserts on every one.
const focusTarget = (container: HTMLElement) => must(within(container).getAllByRole('checkbox')[0])
const isDisabled = (container: HTMLElement) => {
  for (const checkbox of within(container).getAllByRole('checkbox')) expect(checkbox).toBeDisabled()
}

runFieldConformance<readonly number[]>('multiChoiceCards (number options)', {
  build: (props) => <FormMultiChoiceCardsField {...props} options={buyIns} />,
  valid: [5],
  invalid: [],
  interact: setChecked,
  display: displayChecked,
  shown: shownLabels,
  viewText: '£5',
  leaveControl: tabOutOfGroup,
  describedByTarget: fieldsetDescribedByTarget,
  focusTarget,
  isDisabled,
})

describe('FormMultiChoiceCardsField', () => {
  it('keeps the option value type (no string coercion)', async () => {
    const { form, user } = renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="buyIns">
            {() => <FormMultiChoiceCardsField label="Buy-ins" options={buyIns} />}
          </AppField>
        )
      },
      { defaultValues: { buyIns: [] as number[] } },
    )
    await user.click(screen.getByRole('checkbox', { name: '£20' }))
    expect(form.state.values.buyIns).toEqual([20])
  })

  it('shows option meta via optionMeta', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="buyIns">
            {() => (
              <FormMultiChoiceCardsField
                label="Buy-ins"
                options={buyIns}
                optionMeta={(value) => `Pick: ${String(value)}`}
              />
            )}
          </AppField>
        )
      },
      { defaultValues: { buyIns: [5] } },
    )
    expect(screen.getByText('Pick: 5')).toBeInTheDocument()
  })

  it('renders chosen labels in view mode', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="buyIns">
            {() => <FormMultiChoiceCardsField label="Buy-ins" options={buyIns} />}
          </AppField>
        )
      },
      { defaultValues: { buyIns: [10] }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('£10')).toBeInTheDocument()
  })
})
