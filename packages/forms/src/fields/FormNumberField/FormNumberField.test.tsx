import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormNumberField } from '#fields/FormNumberField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

runFieldConformance<number | null>('number', {
  build: (props) => <FormNumberField {...props} />,
  valid: 42,
  invalid: null,
  interact: async (user, control, value) => {
    await user.clear(control)
    if (value !== null) await user.type(control, String(value))
  },
  shown: (value) => (value === null ? '' : String(value)),
})

// These bind through the canonical `form.AppField` path — the same binding the typed
// `f.NumberField` shorthand uses.
describe('FormNumberField', () => {
  it('binds through the canonical field path and clears to null', async () => {
    const { form, user } = renderForm(
      (f) => <f.AppField name="guests">{() => <FormNumberField label="Guests" />}</f.AppField>,
      { defaultValues: { guests: 1 } },
    )
    const control = screen.getByLabelText('Guests')
    await user.clear(control)
    await user.type(control, '4')
    expect(form.state.values.guests).toBe(4)
    await user.clear(control)
    expect(form.state.values.guests).toBeNull()
  })

  it('shows Not provided in view mode when null', () => {
    renderForm(
      (f) => <f.AppField name="guests">{() => <FormNumberField label="Guests" />}</f.AppField>,
      { defaultValues: { guests: null as number | null }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })

  it('formats the view-mode value with formatOptions', () => {
    renderForm(
      (f) => (
        <f.AppField name="rate">
          {() => <FormNumberField label="Pass rate" formatOptions={{ style: 'percent' }} />}
        </f.AppField>
      ),
      { defaultValues: { rate: 0.5 }, formProps: { mode: 'view' } },
    )
    // `Numeral` renders the "%" in its own <span> alongside the digits, so match the whole
    // <data> element's textContent rather than a single text node.
    expect(
      screen.getByText(
        (_, element) => element?.tagName.toLowerCase() === 'data' && element.textContent === '50%',
      ),
    ).toBeInTheDocument()
  })
})
