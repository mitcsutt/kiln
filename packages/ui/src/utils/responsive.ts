import type { CSSProperties } from 'react'

/**
 * Breakpoints are mobile-first min-widths. Keep in sync with `tokens/foundation.css`
 * (`--bp-*` are documentation only — custom properties can't be used in media queries).
 *
 *   base  0      sm  40em (640px)   md  48em (768px)   lg  64em (1024px)   xl  80em (1280px)
 */
export const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl'] as const
export type Breakpoint = (typeof BREAKPOINTS)[number]

/** A value, or a per-breakpoint map of values. `{ base: 2, md: 5 }` */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>

function isBreakpointMap<T>(value: Responsive<T>): value is Partial<Record<Breakpoint, T>> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((k) => (BREAKPOINTS as readonly string[]).includes(k))
  )
}

/**
 * Turns a responsive prop into CSS custom properties, cascading each defined value
 * up to the next defined breakpoint, so CSS can read `var(--x-md)` without fallbacks.
 *
 * responsiveVars('stack-gap', { base: 2, lg: 5 }, space)
 *   → { '--stack-gap-base': .., '--stack-gap-sm': .., '--stack-gap-md': .., '--stack-gap-lg': .., '--stack-gap-xl': .. }
 *
 * Returns `{}` when `value` is undefined, so component CSS falls back to its default.
 */
export function responsiveVars<T>(
  name: string,
  value: Responsive<T> | undefined,
  toCss: (v: T) => string | number,
): CSSProperties {
  if (value === undefined) return {}
  const vars: Record<string, string | number> = {}
  if (!isBreakpointMap(value)) {
    const css = toCss(value)
    for (const bp of BREAKPOINTS) vars[`--${name}-${bp}`] = css
    return vars
  }
  let current: string | number | undefined
  for (const bp of BREAKPOINTS) {
    const v = value[bp]
    if (v !== undefined) current = toCss(v)
    if (current !== undefined) vars[`--${name}-${bp}`] = current
  }
  return vars
}

/**
 * Picks the value for a breakpoint-agnostic context (e.g. a data attribute or JS logic).
 * Returns the `base` value (or the smallest defined one).
 */
export function baseValue<T>(value: Responsive<T> | undefined): T | undefined {
  if (value === undefined) return undefined
  if (!isBreakpointMap(value)) return value
  for (const bp of BREAKPOINTS) if (value[bp] !== undefined) return value[bp]
  return undefined
}

/** Merge several style objects, ignoring undefined. */
export function mergeStyles(...styles: (CSSProperties | undefined)[]): CSSProperties | undefined {
  const defined = styles.filter(
    (s): s is CSSProperties => s !== undefined && Object.keys(s).length > 0,
  )
  if (defined.length === 0) return undefined
  return Object.assign({}, ...defined) as CSSProperties
}
