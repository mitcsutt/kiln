/*
 * Option swatches from a schema. A schema can come from a CMS or a client, and a swatch string is
 * written into a style (as a custom property), so only plain colours get through: a categorical
 * slot, a hex colour, a colour keyword, or a colour function of numbers. No `url()`, `var()`,
 * nesting, quotes or semicolons.
 */

const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const KEYWORD = /^[a-zA-Z]{3,24}$/
const FUNCTION = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([-+0-9a-zA-Z.%,/ ]{1,80}\)$/

/** What a schema option's `swatch` may be, for an issue message. */
export const SWATCH_HINT = 'a categorical slot 1 to 8, or a plain CSS colour'

/** Whether `value` is a swatch a schema may set: a slot `1`–`8` or a plain CSS colour. */
export function isSchemaSwatch(value: unknown): boolean {
  if (typeof value === 'number') return Number.isInteger(value) && value >= 1 && value <= 8
  if (typeof value !== 'string' || value.length > 96) return false
  return HEX.test(value) || KEYWORD.test(value) || FUNCTION.test(value)
}
