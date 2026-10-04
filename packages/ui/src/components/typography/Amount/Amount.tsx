import { forwardRef } from 'react'
import { cx } from '#utils/cx'
import { Numeral, signOf, type NumeralProps } from '#components/typography/Numeral'
import styles from './Amount.module.css'

/** Narrow symbols several common currencies share: showing one alone would misstate the currency. */
const SHARED_NARROW_SYMBOLS = new Set(['$', '¥', 'kr', 'Kr', '₩', '₱', 'Rs'])

/**
 * `symbol` when the locale has a symbol for the currency (AUD in en-AU → "$", GBP in en-GB
 * → "£"); otherwise `narrowSymbol` (GBP in en-AU → "£", not "GBP"), unless that narrow
 * symbol is shared (USD in en-AU stays "USD", never a bare "$" that reads as AUD).
 */
function defaultCurrencyDisplay(
  locale: string,
  currency: string,
): Intl.NumberFormatOptions['currencyDisplay'] {
  try {
    const symbolOf = (display: 'symbol' | 'narrowSymbol') =>
      new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: display })
        .formatToParts(1)
        .find((part) => part.type === 'currency')?.value
    if (symbolOf('symbol') !== currency.toUpperCase()) return 'symbol'
    const narrow = symbolOf('narrowSymbol')
    return narrow !== undefined && !SHARED_NARROW_SYMBOLS.has(narrow) ? 'narrowSymbol' : 'symbol'
  } catch {
    return 'symbol'
  }
}

export interface AmountProps extends Omit<NumeralProps, 'format' | 'signDisplay'> {
  /** ISO 4217 code. Default `AUD`. */
  currency?: string
  /** Fraction digits. Default 2 (0 for compact unless set). */
  precision?: number
  /** Show `+` on positive amounts (and `−` on negatives, as always). */
  showSign?: boolean
  /**
   * Accounting style: negatives in parentheses and in the critical tone. Non-negative
   * amounts reserve the width of the ")" (invisibly), so decimals line up with the
   * bracketed negatives in a right-aligned column.
   */
  accounting?: boolean
  /** Short form for big figures: `$1.2M`. */
  compact?: boolean
  /** Extra `Intl.NumberFormat` options (e.g. `currencyDisplay: 'code'`). Applied last. */
  format?: Intl.NumberFormatOptions
}

/**
 * Money. Built on <Numeral>: tabular figures in the theme's numeric face, a true minus,
 * en-AU / AUD by default. A currency the locale has no symbol for shows its narrow symbol
 * when that is unambiguous (GBP → £ in en-AU) and its ISO code otherwise (USD in en-AU).
 *
 * <Amount value={-1234.5} accounting />  →  ($1,234.50) in the critical tone
 */
export const Amount = forwardRef<HTMLDataElement, AmountProps>(function Amount(
  {
    value,
    currency = 'AUD',
    locale = 'en-AU',
    precision,
    showSign = false,
    accounting = false,
    compact = false,
    format,
    tone,
    suffix,
    className,
    ...rest
  },
  ref,
) {
  const digits = precision ?? (compact ? undefined : 2)
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    currencyDisplay: defaultCurrencyDisplay(locale, currency),
    ...(digits !== undefined
      ? { minimumFractionDigits: digits, maximumFractionDigits: digits }
      : {}),
    ...(compact
      ? { notation: 'compact', ...(digits === undefined ? { maximumFractionDigits: 1 } : {}) }
      : {}),
    ...(accounting ? { currencySign: 'accounting' } : {}),
    ...(showSign ? { signDisplay: 'exceptZero' } : {}),
    ...format,
  }
  // Reserve the ")" of a negative so right-aligned decimals line up. An empty span whose
  // ::after draws a hidden ")": it takes the width but never reaches copy/paste or AT.
  const pad = accounting && signOf(value) !== 'negative'
  const resolvedTone =
    accounting && signOf(value) === 'negative' && (tone === undefined || tone === 'default')
      ? 'critical'
      : tone
  return (
    <Numeral
      ref={ref}
      locale={locale}
      className={cx(styles.amount, className)}
      value={value}
      format={options}
      tone={resolvedTone}
      suffix={
        pad ? (
          <>
            <span className={styles.pad} data-accounting-pad="" aria-hidden="true" />
            {suffix}
          </>
        ) : (
          suffix
        )
      }
      data-accounting={accounting || undefined}
      {...rest}
    />
  )
})
