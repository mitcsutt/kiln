/**
 * Typed handles on the token scales. Components accept these unions as props and map
 * them to CSS variables — consumers never pass raw px, hex or ms values.
 */

/** Spacing steps. Map to `var(--space-N)`; the actual size is theme-controlled (density). */
export const SPACE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
export type Space = (typeof SPACE)[number]
export const space = (s: Space): string => (s === 0 ? '0' : `var(--space-${String(s)})`)

/** Semantic surface / tone names shared by colored components. */
export type Tone = 'neutral' | 'accent' | 'positive' | 'caution' | 'critical' | 'info'

/** Control sizes shared by Button, inputs, Tag, etc. */
export type Size = 'sm' | 'md' | 'lg'

/** Content widths for Container and prose measure. */
export type Width = 'narrow' | 'text' | 'content' | 'wide' | 'full'

export type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

export const alignCss = (a: Align): string =>
  a === 'start' ? 'flex-start' : a === 'end' ? 'flex-end' : a

export const justifyCss = (j: Justify): string =>
  j === 'start'
    ? 'flex-start'
    : j === 'end'
      ? 'flex-end'
      : j === 'between'
        ? 'space-between'
        : j === 'around'
          ? 'space-around'
          : j === 'evenly'
            ? 'space-evenly'
            : j
