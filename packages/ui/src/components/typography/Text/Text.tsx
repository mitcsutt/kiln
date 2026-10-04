import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { baseValue, mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import styles from './Text.module.css'

export type TextSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type TextTone =
  'default' | 'muted' | 'subtle' | 'accent' | 'positive' | 'caution' | 'critical' | 'inverse'
export type TextWeight = 'regular' | 'medium' | 'strong'
export type TextAlign = 'start' | 'center' | 'end'
/** Line-length cap from the width tokens: `narrow` 32rem · `text` 42rem · `content` 68rem. */
export type TextMeasure = 'narrow' | 'text' | 'content'
export type TextElement = 'p' | 'span' | 'div' | 'label' | 'strong' | 'em' | 'small' | 'time'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Step on the type scale. Omit to inherit the surrounding size. Responsive. */
  size?: Responsive<TextSize>
  /** Colour role. Omit to inherit. Status tones use the AA-safe `-text` variants. */
  tone?: TextTone
  /** Omit to inherit (so `as="strong"` stays bold). */
  weight?: TextWeight
  /** Tabular lining figures in the theme's numeric face — for anything that aligns or updates. */
  numeric?: boolean
  /** `true` clips to one line with an ellipsis; a number clamps to that many lines. */
  truncate?: boolean | number
  align?: TextAlign
  /** Cap the line length with a `--width-*` token (`max-inline-size`). Default: none. */
  measure?: TextMeasure
  as?: TextElement
  /** For `as="label"`. */
  htmlFor?: string
  /** For `as="time"`. */
  dateTime?: string
}

/**
 * Body text. Paragraphs by default; any inline role via `as`.
 *
 * <Text size="sm" tone="muted">Updated 3 minutes ago</Text>
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    size,
    tone,
    weight,
    numeric = false,
    truncate,
    align,
    measure,
    as: Comp = 'p',
    className,
    style,
    ...rest
  },
  ref,
) {
  const lines =
    truncate === true ? 1 : typeof truncate === 'number' && truncate > 0 ? truncate : undefined
  const responsive = size !== undefined && typeof size !== 'string'
  return (
    <Comp
      // @ts-expect-error — polymorphic ref across a union of intrinsic elements is safe here
      ref={ref}
      className={cx(styles.text, className)}
      data-size={baseValue(size)}
      data-responsive={responsive || undefined}
      data-tone={tone}
      data-weight={weight}
      data-numeric={numeric || undefined}
      data-truncate={lines === undefined ? undefined : lines === 1 ? 'line' : 'lines'}
      data-align={align}
      data-measure={measure}
      style={mergeStyles(
        responsive ? responsiveVars('text-size', size, (s) => `var(--text-${s})`) : undefined,
        lines !== undefined && lines > 1 ? ({ '--text-lines': lines } as CSSProperties) : undefined,
        style,
      )}
      {...rest}
    />
  )
})
