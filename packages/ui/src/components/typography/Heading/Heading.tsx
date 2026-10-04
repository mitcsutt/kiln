import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import {
  BREAKPOINTS,
  baseValue,
  mergeStyles,
  responsiveVars,
  type Responsive,
} from '#utils/responsive'
import { DEFAULT_HEADING_SIZE } from './sizes'
import styles from './Heading.module.css'
import type { HeadingLevel, HeadingSize } from './sizes'
import { headingTag } from '#utils/heading'

export type { HeadingLevel, HeadingSize }
export type HeadingTone = 'default' | 'muted' | 'accent'
/** Line-length cap from the width tokens: `narrow` 32rem · `text` 42rem · `content` 68rem. */
export type HeadingMeasure = 'narrow' | 'text' | 'content'
export type HeadingElement =
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span' | 'legend'

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Document outline level. Picks the element (`h1`–`h6`) and the default size. */
  level?: HeadingLevel
  /**
   * Visual size, independent of `level`. `display-*` steps use the theme's display role
   * (Newsreader in Monograph, condensed caps in Fiesta, tight grotesk in Ledger); the rest
   * use the heading role. Responsive.
   */
  size?: Responsive<HeadingSize>
  tone?: HeadingTone
  /** `text-wrap: balance` — even line lengths. Default `true`. */
  balance?: boolean
  /** Cap the line length with a `--width-*` token (`max-inline-size`). Default: none. */
  measure?: HeadingMeasure
  /**
   * Render a different element. When it isn't `h1`–`h6` the heading semantics are kept
   * with `role="heading"` + `aria-level`.
   */
  as?: HeadingElement
}

const isDisplay = (s: HeadingSize) => s.startsWith('display')
const roleOf = (s: HeadingSize) => (isDisplay(s) ? 'display' : 'heading')
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

/**
 * Per-breakpoint role attributes (`data-role-md="display"`), cascaded upward like
 * `responsiveVars`, so CSS can switch family/weight/tracking at each breakpoint.
 */
function roleAttrs(size: Responsive<HeadingSize>): Record<string, string> {
  if (typeof size === 'string') return {}
  const attrs: Record<string, string> = {}
  let current: string | undefined
  for (const bp of BREAKPOINTS) {
    const v = size[bp]
    if (v !== undefined) current = roleOf(v)
    if (bp !== 'base' && current !== undefined) attrs[`data-role-${bp}`] = current
  }
  return attrs
}

/**
 * A heading. `level` is the outline, `size` is the look — keep them independent.
 *
 * <Heading level={2} size={{ base: '2xl', md: 'display-sm' }}>Recent releases</Heading>
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, size, tone = 'default', balance = true, measure, as, className, style, ...rest },
  ref,
) {
  const resolved = size ?? DEFAULT_HEADING_SIZE[level]
  const base = baseValue(resolved) ?? DEFAULT_HEADING_SIZE[level]
  const Comp = as ?? headingTag(level)
  const needsRole = !HEADING_TAGS.has(Comp)
  return (
    <Comp
      // @ts-expect-error — polymorphic ref across a union of intrinsic elements is safe here
      ref={ref}
      className={cx(styles.heading, className)}
      data-size={base}
      data-role={roleOf(base)}
      data-tone={tone}
      data-balance={balance ? undefined : 'false'}
      data-measure={measure}
      role={needsRole ? 'heading' : undefined}
      aria-level={needsRole ? level : undefined}
      {...roleAttrs(resolved)}
      style={mergeStyles(
        typeof resolved === 'string'
          ? undefined
          : responsiveVars('heading-size', resolved, (s) => `var(--text-${s})`),
        style,
      )}
      {...rest}
    />
  )
})
