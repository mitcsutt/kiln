export type NumeralSign = 'positive' | 'negative' | 'zero'

/** Resolve a number's sign, treating -0 as zero. */
export function signOf(value: number): NumeralSign {
  return value > 0 ? 'positive' : value < 0 ? 'negative' : 'zero'
}

export interface NumeralPart {
  /** `figure` for digits and signs (tabular); `mark` for separators, symbols and units. */
  kind: 'figure' | 'mark'
  value: string
}

const FIGURE_PARTS = new Set<Intl.NumberFormatPartTypes>([
  'integer',
  'fraction',
  'minusSign',
  'plusSign',
  'nan',
  'infinity',
])

/**
 * Format a number into runs of figures and marks. Hyphens become a true minus sign
 * (U+2212) so negatives are as wide as positives. Adjacent parts of the same kind are
 * merged, so a plain integer is a single run.
 */
export function formatNumeralParts(
  value: number,
  locale = 'en-AU',
  format?: Intl.NumberFormatOptions,
): NumeralPart[] {
  const normalised = Object.is(value, -0) ? 0 : value
  const runs: NumeralPart[] = []
  for (const part of new Intl.NumberFormat(locale, format).formatToParts(normalised)) {
    const kind = FIGURE_PARTS.has(part.type) ? 'figure' : 'mark'
    const text = part.type === 'minusSign' ? '−' : part.value
    const last = runs[runs.length - 1]
    if (last?.kind === kind) last.value += text
    else runs.push({ kind, value: text })
  }
  return runs
}

/** Format a number the way <Numeral> shows it, as a plain string. */
export function formatNumeral(
  value: number,
  locale = 'en-AU',
  format?: Intl.NumberFormatOptions,
): string {
  return formatNumeralParts(value, locale, format)
    .map((p) => p.value)
    .join('')
}
