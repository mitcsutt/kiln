/**
 * `FormAmountField` view mode honours the field's `locale` as well as its `currency`, so
 * `locale="en-GB" currency="GBP"` reads "£12.50" in view mode and FormReview, matching the edit
 * control, rather than "GBP 12.50" from ui `Amount`'s own en-AU default.
 */
import { describe, expect, it } from 'vitest'
import { renderForm } from '#test/renderForm'

describe('FormAmountField view mode honours locale', () => {
  it('AUD in view mode reads "$12.50" (baseline)', () => {
    const { container } = renderForm(
      (f) => <f.AmountField name="paid" label="Amount paid" currency="AUD" />,
      {
        defaultValues: { paid: 12.5 },
        formProps: { mode: 'view' },
      },
    )
    expect(container.textContent).toContain('$12.50')
  })

  it('GBP + locale="en-GB" in view mode reads "£12.50"', () => {
    const { container } = renderForm(
      (f) => <f.AmountField name="paid" label="Amount paid" currency="GBP" locale="en-GB" />,
      { defaultValues: { paid: 12.5 }, formProps: { mode: 'view' } },
    )
    expect(container.textContent).toContain('£12.50')
  })
})
