import type { ComponentType, ReactNode } from 'react'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormRadioField } from '#components/fields/FormRadioField'
import { fieldsetDescribedByTarget, runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

const seats: { value: 1 | 2 | 4; label: string }[] = [
  { value: 1, label: 'One seat' },
  { value: 2, label: 'Two seats' },
  { value: 4, label: 'Four seats' },
]

const labelOf = (value: unknown) => seats.find((s) => s.value === value)?.label ?? ''

const interactRadio = async (user: UserEvent, control: HTMLElement, value: unknown) => {
  await user.click(within(control).getByRole('radio', { name: labelOf(value) }))
}

const displayRadio = (control: HTMLElement) => {
  const checked = within(control).queryByRole('radio', { checked: true })
  return checked ? document.querySelector(`label[for="${checked.id}"]`)?.textContent : undefined
}

// `FormRadioField` renders a Fieldset-wrapped Radix roving-tabindex group: its error (and
// `aria-describedby`) lives on the fieldset, not the inner radiogroup `control()` —
// `describedByTarget` points `blur` there. Roving focus redirects a root-level `.focus()` (and
// an invalid submit's focus) to the checked/current item, not `control()` itself —
// `focusTarget` points there instead. The radiogroup `<div>` is never a `toBeDisabled()`-
// recognised form tag, but each radio IS a real `<button disabled>` — `isDisabled` asserts on
// every one.
const focusTarget = (container: HTMLElement) =>
  within(container).queryByRole('radio', { checked: true }) ??
  must(within(container).getAllByRole('radio')[0])
const isDisabled = (container: HTMLElement) => {
  for (const radio of within(container).getAllByRole('radio')) expect(radio).toBeDisabled()
}

runFieldConformance<number | null>('radio (number options)', {
  build: (props) => <FormRadioField {...props} options={seats} />,
  valid: 2,
  invalid: 4,
  interact: interactRadio,
  display: displayRadio,
  shown: labelOf,
  viewText: 'Two seats',
  describedByTarget: fieldsetDescribedByTarget,
  focusTarget,
  isDisabled,
})

const answers = [
  { value: true, label: 'Yes, keep me posted' },
  { value: false, label: 'No thanks' },
]

runFieldConformance<boolean | null>('radio (boolean options)', {
  build: (props) => <FormRadioField {...props} options={answers} />,
  valid: true,
  invalid: false,
  interact: async (user, control, value) => {
    await user.click(
      within(control).getByRole('radio', {
        name: answers.find((a) => a.value === value)?.label ?? '',
      }),
    )
  },
  display: displayRadio,
  shown: (value) => answers.find((a) => a.value === value)?.label ?? '',
  viewText: 'Yes, keep me posted',
  describedByTarget: fieldsetDescribedByTarget,
  focusTarget,
  isDisabled,
})

describe('FormRadioField', () => {
  it('keeps the option value type (no string coercion)', async () => {
    const { form, user } = renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="seats">{() => <FormRadioField label="Seats" options={seats} />}</AppField>
        )
      },
      { defaultValues: { seats: 1 } },
    )
    await user.click(screen.getByRole('radio', { name: 'Four seats' }))
    expect(form.state.values.seats).toBe(4)
  })

  it('keeps boolean option values (no coercion to string)', async () => {
    const { form, user } = renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="subscribed">
            {() => <FormRadioField label="Subscribe?" options={answers} />}
          </AppField>
        )
      },
      { defaultValues: { subscribed: false } },
    )
    await user.click(screen.getByRole('radio', { name: 'Yes, keep me posted' }))
    expect(form.state.values.subscribed).toBe(true)
  })

  it('renders the option label in view mode', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="seats">{() => <FormRadioField label="Seats" options={seats} />}</AppField>
        )
      },
      { defaultValues: { seats: 4 }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Four seats')).toBeInTheDocument()
    expect(screen.getByText('Four seats').closest('dl')).not.toBeNull()
  })
})
