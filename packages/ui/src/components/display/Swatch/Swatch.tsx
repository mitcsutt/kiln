import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import type { CategoryColor } from '#utils/tokens'
import styles from './Swatch.module.css'

/**
 * A colour a swatch can show: a categorical slot (`1` to `8`, themed in light and dark), or any
 * CSS colour string for a colour that comes from data, such as one a user picked.
 */
export type SwatchColor = CategoryColor | (string & {})

export type SwatchSize = 'sm' | 'md' | 'lg'

export interface SwatchProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color' | 'children'> {
  /**
   * The colour. Prefer a categorical slot (`1` to `8`): it follows the theme and the colour mode.
   * A CSS colour string (`#7c3aed`, `oklch(…)`) is for colours that are data, and renders as given.
   */
  color: SwatchColor
  /**
   * What the colour stands for ("Platform team"), when nothing next to the swatch says it. It
   * names the swatch for screen readers. Without it the swatch is decorative and hidden from them.
   */
  label?: string
  /** Relative to the surrounding text: `sm`, `md` (default) or `lg`. */
  size?: SwatchSize
}

/** Whether `color` is a categorical slot rather than a CSS colour string. */
export function isCategoryColor(color: SwatchColor): color is CategoryColor {
  return typeof color === 'number'
}

/**
 * A small mark in a colour that says who or what something is: a team, a label, a chart series.
 *
 * @remarks
 * Most of the time you don't need `Swatch` itself: {@link Badge | Badge}, {@link Tag | Tag},
 * {@link ToggleChip | ToggleChip} and {@link Indicator | Indicator} take a `swatch` prop that draws
 * this mark for you, sized to their text. Use `Swatch` on its own where there's no host, such as a
 * table cell or a legend you lay out yourself.
 *
 * A swatch takes the theme's chip radius, so it's round where chips are pills and square where
 * they're square, and a hairline keeps a pale colour visible on any surface. It's sized in `em`,
 * so it follows the text beside it.
 *
 * ## Categorical colour marks who, never how
 *
 * A swatch is identity: the same team, label or series in the same colour everywhere it
 * appears. It's never status. For a state ("Overdue", "Live"), use a tone on a `Badge` or a
 * `StatusDot`. Prefer the categorical slots `1` to `8`, which every theme sets for light and dark.
 * Pass a CSS colour only when the colour is data, and give it a `label` or put its name beside
 * it, because colour alone is not information.
 *
 * @privateRemarks
 * The shared part behind every host's `swatch` prop (Badge, Tag, ToggleChip, Indicator), and the
 * legend mark the charts package reuses, so a series looks the same in a chart, its legend and a
 * filter chip. Category slots are `data-color`; a string colour is written inline as `--_swatch`,
 * the same way ColorInput renders a raw colour.
 */
export const Swatch = forwardRef<HTMLSpanElement, SwatchProps>(function Swatch(
  { color, label, size = 'md', className, style, ...rest },
  ref,
) {
  const category = isCategoryColor(color)
  return (
    <span
      ref={ref}
      className={cx(styles.swatch, className)}
      data-color={category ? color : undefined}
      data-size={size}
      style={mergeStyles(
        category ? undefined : ({ '--_swatch': color } as CSSProperties),
        style,
      )}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    />
  )
})
