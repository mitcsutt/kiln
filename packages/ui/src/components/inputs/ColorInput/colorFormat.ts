const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/** `#ABC` / `abc` / `#AABBCC` → `#aabbcc`; `null` when it isn't a hex colour. */
export function normaliseHex(input: string): string | null {
  const match = HEX.exec(input.trim())
  const digits = match?.[1]?.toLowerCase()
  if (!digits) return null
  return `#${
    digits.length === 3
      ? digits
          .split('')
          .map((d) => d + d)
          .join('')
      : digits
  }`
}
