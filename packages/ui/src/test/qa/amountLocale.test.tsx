/**
 * Wave E QA — QA-FMT-1: `Amount` defaults to `locale = 'en-AU'` (via Numeral), so any non-AUD
 * currency renders as its ISO code: `<Amount value={12} currency="GBP" />` → "GBP 12.00", not
 * "£12.00". Seen in stories that pass `currency="GBP"` without `locale` (forms
 * ChoiceCardsField.stories.tsx:33 plan meta). Fix options: default `currencyDisplay:
 * 'narrowSymbol'`, or derive the default locale from the runtime / a ThemeProvider locale.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Amount } from '#components/typography/Amount'

describe('QA-FMT-1: Amount with a non-AUD currency and no locale', () => {
  it('AUD reads as a symbol (baseline)', () => {
    const { container } = render(<Amount value={12} currency="AUD" />)
    expect(container.textContent).toContain('$12.00')
  })

  it('GBP with locale="en-GB" reads "£12.00"', () => {
    const { container } = render(<Amount value={12} currency="GBP" locale="en-GB" />)
    expect(container.textContent).toContain('£12.00')
  })

  it('QA-FMT-1: GBP without a locale reads "£12.00", not "GBP 12.00"', () => {
    const { container } = render(<Amount value={12} currency="GBP" />)
    expect(container.textContent).toContain('£12.00')
  })
})
