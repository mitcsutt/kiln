import type { ComponentType, ReactNode } from 'react'
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormChoiceCardsField } from '#fields/FormChoiceCardsField'
import { fieldsetDescribedByTarget, runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

const buyIns: { value: 5 | 10 | 20; label: string }[] = [
  { value: 5, label: '£5' },
  { value: 10, label: '£10' },
  { value: 20, label: '£20' },
]

const labelOf = (value: unknown) => buyIns.find((b) => b.value === value)?.label ?? ''

const displayRadio = (control: HTMLElement) =>
  within(control).queryByRole('radio', { checked: true })?.textContent

// `ChoiceCards` (type="single") is a Fieldset-wrapped roving-tabindex group: its error (and
// `aria-describedby`) lives on the fieldset, not the inner radiogroup `control()` —
// `describedByTarget` points `blur` there, `focusTarget`/`isDisabled` point at the checked/
// current card and every card respectively, same as FormRadioField.
const focusTarget = (container: HTMLElement) =>
  within(container).queryByRole('radio', { checked: true }) ??
  must(within(container).getAllByRole('radio')[0])
const isDisabled = (container: HTMLElement) => {
  for (const radio of within(container).getAllByRole('radio')) expect(radio).toBeDisabled()
}

runFieldConformance<number | null>('choiceCards (number options)', {
  build: (props) => <FormChoiceCardsField {...props} options={buyIns} />,
  valid: 10,
  invalid: 20,
  interact: async (user, control, value) => {
    await user.click(within(control).getByRole('radio', { name: labelOf(value) }))
  },
  display: displayRadio,
  shown: labelOf,
  viewText: '£10',
  describedByTarget: fieldsetDescribedByTarget,
  focusTarget,
  isDisabled,
})

describe('FormChoiceCardsField', () => {
  it('keeps the option value type (no string coercion)', async () => {
    const { form, user } = renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="buyIn">
            {() => <FormChoiceCardsField label="Buy-in" options={buyIns} />}
          </AppField>
        )
      },
      { defaultValues: { buyIn: 5 } },
    )
    await user.click(screen.getByRole('radio', { name: '£20' }))
    expect(form.state.values.buyIn).toBe(20)
  })

  it('shows option meta via optionMeta', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="buyIn">
            {() => (
              <FormChoiceCardsField
                label="Buy-in"
                options={buyIns}
                optionMeta={(value) => `Pick: ${String(value)}`}
              />
            )}
          </AppField>
        )
      },
      { defaultValues: { buyIn: 5 } },
    )
    expect(screen.getByText('Pick: 5')).toBeInTheDocument()
  })

  it('renders the option label in view mode', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="buyIn">
            {() => <FormChoiceCardsField label="Buy-in" options={buyIns} />}
          </AppField>
        )
      },
      { defaultValues: { buyIn: 20 }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('£20')).toBeInTheDocument()
    expect(screen.getByText('£20').closest('dl')).not.toBeNull()
  })
})
