/**
 * `Amount` defaults to `locale = 'en-AU'` (via Numeral). With `currencyDisplay: 'symbol'` alone,
 * a non-AUD currency would render as its ISO code: `<Amount value={12} currency="GBP" />` →
 * "GBP 12.00", not "£12.00". Amount falls back to `narrowSymbol` so a currency passed without a
 * matching `locale` still reads as its symbol.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Amount } from '#components/typography/Amount'

describe('Amount with a non-AUD currency and no locale', () => {
  it('AUD reads as a symbol (baseline)', () => {
    const { container } = render(<Amount value={12} currency="AUD" />)
    expect(container.textContent).toContain('$12.00')
  })

  it('GBP with locale="en-GB" reads "£12.00"', () => {
    const { container } = render(<Amount value={12} currency="GBP" locale="en-GB" />)
    expect(container.textContent).toContain('£12.00')
  })

  it('GBP without a locale reads "£12.00", not "GBP 12.00"', () => {
    const { container } = render(<Amount value={12} currency="GBP" />)
    expect(container.textContent).toContain('£12.00')
  })
})
