import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import { space, type Space, type CategoryColor } from '#utils/tokens'
import styles from './Box.module.css'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'

export type BoxElement =
  'div' | 'span' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'li'
export type BoxSurface =
  | 'none'
  | 'canvas'
  | 'surface'
  | 'sunken'
  | 'raised'
  | 'inverse'
  | 'accent'
  | `cat-${CategoryColor}`
export type BoxRadius = 'none' | 'field' | 'surface' | 'media'

export interface BoxProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /** Padding on every side. Responsive. */
  padding?: Responsive<Space>
  /** Inline (left/right) padding; overrides `padding` on that axis. Responsive. */
  paddingX?: Responsive<Space>
  /** Block (top/bottom) padding; overrides `padding` on that axis. Responsive. */
  paddingY?: Responsive<Space>
  /**
   * Background fill. `inverse`, `accent` and the categorical `cat-1` to `cat-8` (one person's or
   * team's colour, matching their `Tag`) also re-point ink, line and accent colours for its
   * children, so they stay legible on the fill.
   */
  surface?: BoxSurface
  /**
   * On an `inverse`, `accent` or categorical fill, re-point the status tones too, so tone text
   * and soft tone fills (a `Stat` delta, a toned `Numeral` or `Text`, a soft `Badge`) stay AA on
   * the fill. On `accent` and categorical fills tone text becomes the fill's ink, so the sign,
   * glyph or label carries the status; on `inverse` each tone keeps its hue. Off by default, so
   * tones keep the page's colours. No effect on other surfaces.
   */
  adaptTones?: boolean
  /** Hairline border in `--color-line`. One edge treatment per element — a border *or* a fill. */
  border?: boolean
  /** Corner radius, by role. */
  radius?: BoxRadius
  as?: BoxElement
}

/**
 * Padding, a surface and an edge, and nothing else. The escape hatch when no other layout fits.
 *
 * @remarks
 * `Box` adds padding, a background surface, a border and a radius to its content. Reach for
 * `Stack`, `Inline` or `Grid` to arrange things, and for `Card` when something is a self-contained
 * object. `Box` is for the wells and frames left over.
 *
 * @privateRemarks
 * The escape hatch: padding, a surface and an edge — nothing else. Reach for
 * Stack/Inline/Grid for arrangement and Card for self-contained objects first.
 *
 * <Box padding={{ base: 4, md: 5 }} surface="sunken" radius="surface">…</Box>
 */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  {
    padding,
    paddingX,
    paddingY,
    surface = 'none',
    adaptTones = false,
    border = false,
    radius = 'none',
    as: Comp = 'div',
    hideBelow,
    hideAbove,
    className,
    style,
    ...rest
  },
  ref,
) {
  return (
    <Comp
      // @ts-expect-error — polymorphic ref across a union of intrinsic elements is safe here
      ref={ref}
      className={cx(styles.box, visibilityClass({ hideBelow, hideAbove }), className)}
      data-surface={surface === 'none' ? undefined : surface}
      data-adapt-tones={adaptTones || undefined}
      data-border={border || undefined}
      data-radius={radius === 'none' ? undefined : radius}
      style={mergeStyles(
        responsiveVars('box-p', padding, space),
        responsiveVars('box-px', paddingX, space),
        responsiveVars('box-py', paddingY, space),
        style,
      )}
      {...rest}
    />
  )
})
