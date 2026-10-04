import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormSelectField } from '#fields/FormSelectField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

const seats: { value: 1 | 2 | 4; label: string }[] = [
  { value: 1, label: 'One seat' },
  { value: 2, label: 'Two seats' },
  { value: 4, label: 'Four seats' },
]

const pickOption =
  (labelOf: (value: unknown) => string) =>
  async (user: UserEvent, control: HTMLElement, value: unknown) => {
    await user.click(control)
    await user.click(await screen.findByRole('option', { name: labelOf(value) }))
  }

runFieldConformance<number | null>('select (number options, emptyOption)', {
  build: (props) => (
    <FormSelectField {...props} options={seats} emptyOption="No preference" placeholder="Choose" />
  ),
  valid: 2,
  invalid: null,
  interact: pickOption((value) => seats.find((s) => s.value === value)?.label ?? 'No preference'),
  display: (control) => control.textContent,
  shown: (value) => seats.find((s) => s.value === value)?.label ?? 'Choose',
  viewText: 'Two seats',
})

const answers = [
  { value: true, label: 'Yes, keep me posted' },
  { value: false, label: 'No thanks' },
]

runFieldConformance<boolean | null>('select (boolean options)', {
  build: (props) => <FormSelectField {...props} options={answers} placeholder="Choose" />,
  valid: true,
  invalid: false,
  interact: pickOption((value) => answers.find((a) => a.value === value)?.label ?? ''),
  display: (control) => control.textContent,
  shown: (value) => answers.find((a) => a.value === value)?.label ?? 'Choose',
  viewText: 'Yes, keep me posted',
})

describe('FormSelectField', () => {
  it('keeps the option value type (no string coercion)', async () => {
    const { form, user } = renderForm(
      (f) => <f.SelectField name="seats" label="Seats" options={seats} placeholder="Choose" />,
      { defaultValues: { seats: 1 } },
    )
    await user.click(screen.getByRole('combobox', { name: 'Seats' }))
    await user.click(await screen.findByRole('option', { name: 'Four seats' }))
    expect(form.state.values.seats).toBe(4)
  })

  it('maps the empty option to null', async () => {
    const { form, user } = renderForm(
      (f) => (
        <f.SelectField
          name="seats"
          label="Seats"
          options={seats}
          emptyOption="No preference"
          placeholder="Choose"
        />
      ),
      { defaultValues: { seats: 2 } },
    )
    await user.click(screen.getByRole('combobox', { name: 'Seats' }))
    await user.click(await screen.findByRole('option', { name: 'No preference' }))
    expect(form.state.values.seats).toBeNull()
  })

  it('renders grouped options under headings', async () => {
    const { user } = renderForm(
      (f) => (
        <f.SelectField
          name="city"
          label="City"
          placeholder="Choose"
          options={[
            { value: 'lis', label: 'Lisbon', group: 'Europe' },
            { value: 'rom', label: 'Rome', group: 'Europe' },
            { value: 'tyo', label: 'Tokyo', group: 'Asia' },
          ]}
        />
      ),
      { defaultValues: { city: 'lis' } },
    )
    await user.click(screen.getByRole('combobox', { name: 'City' }))
    expect(await screen.findByText('Asia')).toBeInTheDocument()
  })

  it('does not count opening the list as leaving the field', async () => {
    const { user } = renderForm(
      (f) => (
        <f.SelectField
          name="seats"
          label="Seats"
          options={seats}
          placeholder="Choose"
          validators={{
            onBlur: ({ value }) => (value === null ? 'Choose a number of seats' : undefined),
          }}
        />
      ),
      { defaultValues: { seats: null as number | null } },
    )
    await user.click(screen.getByRole('combobox', { name: 'Seats' }))
    await screen.findByRole('option', { name: 'One seat' })
    expect(screen.queryByText('Choose a number of seats')).not.toBeInTheDocument()
  })

  it('renders the option label in view mode', () => {
    renderForm((f) => <f.SelectField name="seats" label="Seats" options={seats} />, {
      defaultValues: { seats: 4 },
      formProps: { mode: 'view' },
    })
    expect(screen.getByText('Four seats')).toBeInTheDocument()
    expect(screen.getByText('Four seats').closest('dl')).not.toBeNull()
  })
})
