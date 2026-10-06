import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import { space, type Space, type CategoryColor } from '#utils/tokens'
import styles from './Box.module.css'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'

export type BoxElement =
  'div' | 'span' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'li'
export type BoxSurface =
  'none' | 'canvas' | 'surface' | 'sunken' | 'raised' | 'inverse' | `cat-${CategoryColor}`
export type BoxRadius = 'none' | 'field' | 'surface' | 'media'

export interface BoxProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /** Padding on every side. Responsive. */
  padding?: Responsive<Space>
  /** Inline (left/right) padding; overrides `padding` on that axis. Responsive. */
  paddingX?: Responsive<Space>
  /** Block (top/bottom) padding; overrides `padding` on that axis. Responsive. */
  paddingY?: Responsive<Space>
  /**
   * Background fill. `inverse` and the categorical `cat-1` to `cat-8` (one person's or team's
   * colour, matching their `Tag`) also re-point ink and line colours for its children.
   */
  surface?: BoxSurface
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
