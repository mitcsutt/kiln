import type { CSSProperties } from 'react'

/** Custom properties as a `style` object; `undefined` values are left out. */
export function cssVars(vars: Readonly<Record<`--${string}`, string | undefined>>): CSSProperties {
  const style: Record<string, string> = {}
  for (const [name, value] of Object.entries(vars)) if (value !== undefined) style[name] = value
  return style
}

/** Joins styles left to right, so a consumer's `style` (passed last) wins. */
export function mergeStyles(...styles: (CSSProperties | undefined)[]): CSSProperties | undefined {
  const defined = styles.filter((s) => s !== undefined)
  return defined.length === 0
    ? undefined
    : defined.reduce<CSSProperties>((all, style) => ({ ...all, ...style }), {})
}
