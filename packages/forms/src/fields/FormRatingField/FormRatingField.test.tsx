import type { ComponentType, ReactNode } from 'react'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormRatingField } from '#fields/FormRatingField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

const itemLabel = (n: number) => `${String(n)} of 5`

const displayStars = (control: HTMLElement) => {
  const checked = within(control).queryByRole('radio', { checked: true })
  return checked?.getAttribute('aria-label')
}

const interactStars = async (user: UserEvent, control: HTMLElement, value: number | null) => {
  if (value === null) return
  await user.click(within(control).getByRole('radio', { name: itemLabel(value) }))
}

// `FormRatingField` wraps in `Field` (not `Fieldset`), which wires `aria-describedby` onto the
// control itself, so `blur` passes unaided. It's still a Radix roving-tabindex group (RadioGroup
// under the hood), so `focusTarget`/`isDisabled` point at the checked/current star and every
// star respectively, same as FormRadioField.
const focusTarget = (container: HTMLElement) =>
  within(container).queryByRole('radio', { checked: true }) ??
  must(within(container).getAllByRole('radio')[0])
const isDisabled = (container: HTMLElement) => {
  for (const radio of within(container).getAllByRole('radio')) expect(radio).toBeDisabled()
}

runFieldConformance<number | null>('rating', {
  build: (props) => <FormRatingField {...props} max={5} />,
  valid: 3,
  invalid: 5,
  interact: interactStars,
  display: displayStars,
  shown: (value) => (value === null ? '' : itemLabel(value)),
  viewText: '3',
  focusTarget,
  isDisabled,
})

describe('FormRatingField', () => {
  it('clears to null when clearable and the current rating is chosen again', async () => {
    const { form, user } = renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="rating">
            {() => <FormRatingField label="Rate your stay" clearable />}
          </AppField>
        )
      },
      { defaultValues: { rating: 3 } },
    )
    await user.click(screen.getByRole('radio', { name: '3 of 5' }))
    expect(form.state.values.rating).toBeNull()
  })

  it('renders the rating in view mode; empty when null', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return <AppField name="rating">{() => <FormRatingField label="Rate your stay" />}</AppField>
      },
      { defaultValues: { rating: null as number | null }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })
})
