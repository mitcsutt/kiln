import { normaliseNumberText } from '#components/inputs/NumberInput/numberFormat'

/**
 * Parse typed text straight to integer minor units — string arithmetic, so "0.1 + 0.2"
 * style float error can't creep into money. `null` = empty, `NaN` = not an amount.
 */
export function parseMinorUnits(
  text: string,
  locale: string | undefined,
  digits: number,
  allowNegative: boolean,
): number | null {
  const normalised = normaliseNumberText(text, locale)
  if (normalised === '') return null
  if (normalised === null) return Number.NaN
  const negative = normalised.startsWith('-')
  if (negative && !allowNegative) return Number.NaN
  const [intPart = '', fracPart = ''] = normalised.replace('-', '').split('.')
  const padded = fracPart.padEnd(digits + 1, '0')
  let minor = Number(intPart || '0') * 10 ** digits + Number(padded.slice(0, digits) || '0')
  if (Number(padded.charAt(digits)) >= 5) minor += 1
  if (!Number.isSafeInteger(minor)) return Number.NaN
  return negative && minor !== 0 ? -minor : minor
}
