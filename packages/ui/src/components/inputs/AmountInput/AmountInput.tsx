import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'
import { Input, type InputProps } from '#components/inputs/Input'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { joinIds } from '#components/inputs/internal/refs'
import { parseMinorUnits } from './amountFormat'

export type AmountUnit = 'major' | 'minor'
export type AmountCurrencyDisplay = 'symbol' | 'code' | 'both' | 'none'

export interface AmountInputProps extends Omit<
  InputProps,
  | 'type'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'numeric'
  | 'leading'
  | 'trailing'
  | 'min'
  | 'max'
> {
  /** The amount in `unit`s, or `null` when empty. */
  value?: number | null
  defaultValue?: number | null
  /** Called while typing (on every text that parses) and on commit. `null` when cleared. */
  onValueChange?: (value: number | null) => void
  /** ISO 4217 code — sets the symbol and the number of decimals (AUD 2, JPY 0, BHD 3). */
  currency: string
  /** Locale for parsing and formatting. Defaults to the browser's. */
  locale?: string
  /**
   * `major` (default) — dollars as a number (`1450.5`).
   * `minor` — integer cents (`145050`): recommended for money, never a float.
   */
  unit?: AmountUnit
  /** Accept a leading minus (refunds, adjustments). Default `false`. */
  allowNegative?: boolean
  /** `symbol` (default) leads with "$"; `code` trails "AUD"; `both`; or `none`. */
  showCurrency?: AmountCurrencyDisplay
  /**
   * Bounds, in `unit`s, for form validation. The input never clamps money on its own —
   * a silently changed amount is worse than an error message.
   */
  min?: number
  max?: number
}

interface CurrencyInfo {
  digits: number
  symbol: string
}

function currencyInfo(currency: string, locale: string | undefined): CurrencyInfo {
  try {
    const format = new Intl.NumberFormat(locale, { style: 'currency', currency })
    return {
      digits: format.resolvedOptions().maximumFractionDigits ?? 2,
      symbol: format.formatToParts(0).find((p) => p.type === 'currency')?.value ?? currency,
    }
  } catch {
    return { digits: 2, symbol: currency }
  }
}

const toMinor = (value: number, unit: AmountUnit, digits: number) =>
  unit === 'minor' ? Math.round(value) : Math.round(Number(`${String(value)}e${String(digits)}`))
const fromMinor = (minor: number, unit: AmountUnit, digits: number) =>
  unit === 'minor' ? minor : Number(`${String(minor)}e-${String(digits)}`)

/**
 * Money, typed as text (a textbox, not a spinbutton — arrow keys shouldn't nudge a rent
 * payment). Decimals come from the currency; grouped when blurred ("1,450.00"), raw while
 * focused ("1450.00"). Tabular and right-aligned like every amount. The ref goes to the
 * text input; `name` is submitted as a plain number in `unit`s.
 *
 * <AmountInput currency="AUD" unit="minor" value={rentCents} onValueChange={setRentCents} />
 */
export const AmountInput = markFieldAware(
  forwardRef<HTMLInputElement, AmountInputProps>(function AmountInput(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      currency,
      locale,
      unit = 'major',
      allowNegative = false,
      showCurrency = 'symbol',
      // Bounds are for forms validation only — never sent to the text input, never clamped.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      min: _min,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      max: _max,
      name,
      form,
      disabled,
      onFocus,
      onBlur,
      onKeyDown,
      'aria-describedby': describedBy,
      ...rest
    },
    ref,
  ) {
    const currencyId = `${useId()}currency`
    // Only for the hidden input: the visible Input resolves its own Field wiring.
    const field = useResolvedField({ disabled })
    const { digits, symbol } = useMemo(() => currencyInfo(currency, locale), [currency, locale])
    const isControlled = valueProp !== undefined
    const [internal, setInternal] = useState<number | null>(defaultValue ?? null)
    const value = isControlled ? valueProp : internal
    const minor = value == null ? null : toMinor(value, unit, digits)
    const [focused, setFocused] = useState(false)
    const [draft, setDraft] = useState('')

    const grouped = useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }),
      [locale, digits],
    )
    const plain = useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
          useGrouping: false,
        }),
      [locale, digits],
    )
    const display = (m: number | null) =>
      m == null ? '' : grouped.format(Number(`${String(m)}e-${String(digits)}`))
    const raw = (m: number | null) =>
      m == null ? '' : plain.format(Number(`${String(m)}e-${String(digits)}`))
    const parse = (text: string) => parseMinorUnits(text, locale, digits, allowNegative)

    useEffect(() => {
      if (!focused) return
      const parsed = parse(draft)
      if (parsed !== minor && !(parsed == null && minor == null)) setDraft(raw(minor))
      // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the value changing
    }, [minor])

    const setMinor = (next: number | null) => {
      const nextValue = next == null ? null : fromMinor(next, unit, digits)
      if (!isControlled) setInternal(nextValue)
      if (next !== minor) onValueChange?.(nextValue)
    }

    const commit = () => {
      const parsed = parse(draft)
      if (parsed != null && Number.isNaN(parsed)) {
        setDraft(raw(minor))
        return
      }
      setMinor(parsed)
      setDraft(raw(parsed))
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value
      setDraft(text)
      const parsed = parse(text)
      if (parsed == null || !Number.isNaN(parsed)) setMinor(parsed)
    }

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setFocused(true)
      setDraft(raw(minor))
      onFocus?.(event)
    }

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      commit()
      setFocused(false)
      onBlur?.(event)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (!event.defaultPrevented && event.key === 'Enter') commit()
    }

    const code = currency.toUpperCase()
    const leading = showCurrency === 'symbol' || showCurrency === 'both' ? symbol : undefined
    const trailing =
      showCurrency === 'code' || (showCurrency === 'both' && symbol !== code) ? code : undefined

    return (
      <>
        <Input
          ref={ref}
          {...rest}
          disabled={disabled}
          numeric
          type="text"
          inputMode={allowNegative ? 'text' : digits === 0 ? 'numeric' : 'decimal'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          leading={leading}
          trailing={trailing}
          value={focused ? draft : display(minor)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          form={form}
          aria-describedby={joinIds(describedBy, currencyId)}
        />
        {/* The symbol is decorative in the box; this names the currency for screen readers. */}
        <span id={currencyId} hidden>
          {code}
        </span>
        {/* Disabled like the control it stands for: a disabled control submits nothing. */}
        {name != null ? (
          <input
            type="hidden"
            name={name}
            form={form}
            value={value == null ? '' : String(value)}
            disabled={field.disabled}
          />
        ) : null}
      </>
    )
  }),
)
