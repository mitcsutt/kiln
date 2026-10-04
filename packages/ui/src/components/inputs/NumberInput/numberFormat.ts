/*
 * Locale-aware number text <-> value helpers shared by NumberInput and AmountInput.
 * Internal to the forms group — not exported from the package.
 */

export interface LocaleSymbols {
  group: string
  decimal: string
}

const symbolCache = new Map<string, LocaleSymbols>()

/** The group and decimal separators a locale uses, learnt from `formatToParts(1111.1)`. */
export function localeSymbols(locale: string | undefined): LocaleSymbols {
  const key = locale ?? ''
  const cached = symbolCache.get(key)
  if (cached) return cached
  const parts = new Intl.NumberFormat(locale).formatToParts(1111.1)
  const symbols = {
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
  }
  symbolCache.set(key, symbols)
  return symbols
}

// Any space, incl. no-break (U+00A0), narrow no-break (U+202F) and thin (U+2009) spaces.
const SPACES = /[\s\u00a0\u202f\u2009]/g
// Minus sign, figure dash, en dash, small and full-width hyphen-minus.
const MINUS = /[\u2212\u2012\u2013\ufe63\uff0d]/g

/**
 * Normalise typed text to a plain `-123.45` string, or `null` if it isn't a number yet
 * (`''` for empty). Group separators are dropped; the locale's decimal becomes `.`.
 * Anything else that isn't a digit (a currency sign, `%`) is ignored.
 */
export function normaliseNumberText(text: string, locale: string | undefined): string | null {
  const { group, decimal } = localeSymbols(locale)
  let s = text.replace(MINUS, '-')
  // Spacey group separators (fr-FR, sv-SE) arrive as any kind of space.
  if (group.replace(SPACES, '') === '') s = s.replace(SPACES, '')
  else s = s.split(group).join('').replace(SPACES, '')
  if (decimal !== '.') s = s.split(decimal).join('.')
  const negative = s.startsWith('-') || (s.startsWith('(') && s.endsWith(')'))
  s = s.replace(/[^\d.]/g, '')
  if (s === '') return negative ? null : ''
  if ((s.match(/\./g) ?? []).length > 1) return null
  if (!/\d/.test(s)) return null
  return negative ? `-${s}` : s
}

/**
 * Parse typed text into a number. `null` = empty, `NaN` = not a number (yet) — callers
 * never emit `NaN`.
 */
export function parseNumber(text: string, locale: string | undefined): number | null {
  const normalised = normaliseNumberText(text, locale)
  if (normalised === '') return null
  if (normalised === null) return Number.NaN
  const value = Number(normalised)
  return Number.isFinite(value) ? value : Number.NaN
}

/** How many decimals a step has: 1 → 0, 0.25 → 2, 1e-3 → 3. */
export function decimalsOf(n: number): number {
  if (!Number.isFinite(n) || Number.isInteger(n)) return 0
  const text = n.toString()
  const exp = /e-(\d+)$/.exec(text)
  if (exp?.[1]) return Number(exp[1]) + (text.split('e')[0]?.split('.')[1]?.length ?? 0)
  return text.split('.')[1]?.length ?? 0
}

/** Round to `decimals` places without the 1.005 → 1.00 float trap. */
export function roundTo(value: number, decimals: number): number {
  if (decimals <= 0) return Math.round(value)
  return Number(
    `${String(Math.round(Number(`${String(value)}e${String(decimals)}`)))}e-${String(decimals)}`,
  )
}

export function clamp(value: number, min: number | undefined, max: number | undefined): number {
  let v = value
  if (max != null && v > max) v = max
  if (min != null && v < min) v = min
  return v
}

/** Text for editing: the locale's decimal, no grouping, no symbols. */
export function formatRaw(
  value: number | null,
  locale: string | undefined,
  fractionDigits?: number,
): string {
  if (value == null || Number.isNaN(value)) return ''
  return new Intl.NumberFormat(locale, {
    useGrouping: false,
    minimumFractionDigits: fractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? 20,
  }).format(value)
}
