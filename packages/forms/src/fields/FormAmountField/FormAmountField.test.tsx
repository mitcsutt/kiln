import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormAmountField } from '#fields/FormAmountField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

runFieldConformance<number | null>('amount', {
  build: (props) => <FormAmountField currency="AUD" {...props} />,
  valid: 100,
  invalid: null,
  interact: async (user, control, value) => {
    await user.clear(control)
    if (value !== null) await user.type(control, String(value))
  },
  // AmountInput pads to the currency's decimals once the controlled value changes under it
  // (e.g. a reset) while still focused — never the bare typed digits.
  shown: (value) => (value === null ? '' : value.toFixed(2)),
  // `Amount` splits the currency symbol and separators into their own spans (tabular figures),
  // so match the whole `<data>` element's text.
  viewText: (_, element) =>
    element?.tagName.toLowerCase() === 'data' && element.textContent === '$100.00',
})

/** `Amount`/`Numeral` split separators (currency symbol, thousands, decimal point) into their
 * own `<span>`s for tabular alignment, so the rendered figure is never one text node — match
 * the whole `<data>` element's `textContent` instead of a plain string/RegExp. */
const getByFormattedText = (pattern: RegExp) =>
  screen.getByText(
    (_, element) => element?.tagName.toLowerCase() === 'data' && pattern.test(element.textContent),
  )

describe('FormAmountField', () => {
  it('binds and clears to null', async () => {
    const { form, user } = renderForm(
      (f) => <f.AmountField name="retainer" label="Monthly retainer" currency="AUD" />,
      { defaultValues: { retainer: null as number | null } },
    )
    const control = screen.getByLabelText('Monthly retainer')
    await user.type(control, '1450.5')
    expect(form.state.values.retainer).toBe(1450.5)
    await user.clear(control)
    expect(form.state.values.retainer).toBeNull()
  })

  it('renders a formatted amount in view mode', () => {
    renderForm((f) => <f.AmountField name="retainer" label="Monthly retainer" currency="AUD" />, {
      defaultValues: { retainer: 100 },
      formProps: { mode: 'view' },
    })
    expect(getByFormattedText(/100\.00/)).toBeInTheDocument()
  })

  it('stores minor units but shows a major-unit amount in view mode', () => {
    renderForm(
      (f) => <f.AmountField name="retainer" label="Monthly retainer" currency="AUD" unit="minor" />,
      { defaultValues: { retainer: 145050 }, formProps: { mode: 'view' } },
    )
    expect(getByFormattedText(/1,450\.50/)).toBeInTheDocument()
  })

  it('shows Not provided in view mode when null', () => {
    renderForm((f) => <f.AmountField name="retainer" label="Monthly retainer" currency="AUD" />, {
      defaultValues: { retainer: null as number | null },
      formProps: { mode: 'view' },
    })
    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })
})
