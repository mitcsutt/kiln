/*
 * Reads a theme stylesheet's colour tokens as numbers, so tests can check lightness order and
 * WCAG contrast instead of trusting the comments. Handles what Kiln's themes write: `oklch(L C H)`,
 * `light-dark(<light>, <dark>)` and `var(--token)` pointing at another token in the same file.
 */
import { must } from '#test/must'

export type Mode = 'light' | 'dark'
export interface Oklch {
  l: number
  c: number
  h: number
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Every `--token: value;` in a stylesheet, values with whitespace collapsed. */
export function declarations(css: string): Map<string, string> {
  return new Map(
    [...stripComments(css).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [
      must(m[1]),
      must(m[2]).replace(/\s+/g, ' ').trim(),
    ]),
  )
}

/** The two arguments of `light-dark(a, b)`, split on the comma outside any parentheses. */
function lightDarkHalves(value: string): [string, string] | null {
  const match = /^light-dark\((.*)\)$/.exec(value)
  if (!match) return null
  const inner = must(match[1])
  let depth = 0
  for (let index = 0; index < inner.length; index++) {
    const char = inner[index]
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0)
      return [inner.slice(0, index).trim(), inner.slice(index + 1).trim()]
  }
  return null
}

/** A token's colour in one mode, following `var()` and `light-dark()`; throws if it isn't one. */
export function resolveColour(tokens: Map<string, string>, name: string, mode: Mode): Oklch {
  const value = tokens.get(name)
  if (value === undefined) throw new Error(`${name} is not set`)
  return resolveValue(tokens, value, mode, name)
}

function resolveValue(tokens: Map<string, string>, value: string, mode: Mode, name: string): Oklch {
  const reference = /^var\((--[a-z0-9-]+)\)$/.exec(value)
  if (reference) return resolveColour(tokens, must(reference[1]), mode)
  const halves = lightDarkHalves(value)
  if (halves) return resolveValue(tokens, mode === 'light' ? halves[0] : halves[1], mode, name)
  const colour = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(value)
  if (!colour) throw new Error(`${name} is not an opaque oklch() colour in ${mode} mode: ${value}`)
  return { l: Number(colour[1]), c: Number(colour[2]), h: Number(colour[3]) }
}

/** WCAG 2 relative luminance of an OKLCH colour, clipped to the sRGB gamut. */
export function luminance({ l, c, h }: Oklch): number {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const lms = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0638541728 * b,
    l - 0.0894841775 * a - 1.291485548 * b,
  ].map((v) => v ** 3)
  const [L, M, S] = [must(lms[0]), must(lms[1]), must(lms[2])]
  const clip = (v: number) => Math.min(1, Math.max(0, v))
  const r = clip(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S)
  const g = clip(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S)
  const bl = clip(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S)
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl
}

/** WCAG 2 contrast ratio between two colours (1 to 21). */
export function contrast(one: Oklch, two: Oklch): number {
  const [hi, lo] = [luminance(one), luminance(two)].sort((x, y) => y - x)
  return (must(hi) + 0.05) / (must(lo) + 0.05)
}
