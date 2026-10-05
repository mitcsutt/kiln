import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import { alignCss, space, type Align, type Space } from '#utils/tokens'
import styles from './Grid.module.css'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type GridMinItemWidth = 'xs' | 'sm' | 'md' | 'lg'
export type GridElement = 'div' | 'section' | 'ul' | 'ol' | 'dl'
export type GridItemElement = 'div' | 'li' | 'article' | 'section' | 'aside'

interface GridBaseProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /** Space between cells (both axes). Responsive. */
  gap?: Responsive<Space>
  /** Row gap, if different from `gap`. Responsive. */
  rowGap?: Responsive<Space>
  /** Cell alignment on the block axis. Default `stretch`. Responsive. */
  align?: Responsive<Align>
  as?: GridElement
}

interface GridColumnsProps extends GridBaseProps {
  /** A fixed track count, 1–12. Responsive: `{ base: 1, sm: 2, lg: 4 }`. */
  columns?: Responsive<GridColumns>
  minItemWidth?: never
}

interface GridAutoProps extends GridBaseProps {
  columns?: never
  /**
   * Fit as many tracks as there's room for, each at least this wide
   * (xs 12rem · sm 16rem · md 20rem · lg 24rem). No breakpoints needed.
   */
  minItemWidth: GridMinItemWidth
}

export type GridProps = GridColumnsProps | GridAutoProps

const tracks = (n: GridColumns): string => `repeat(${String(n)}, minmax(0, 1fr))`

const GridRoot = forwardRef<HTMLElement, GridProps>(function Grid(
  {
    columns,
    minItemWidth,
    gap,
    rowGap,
    align,
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
      className={cx(styles.grid, visibilityClass({ hideBelow, hideAbove }), className)}
      data-min-item={minItemWidth}
      role={Comp === 'ul' || Comp === 'ol' ? 'list' : undefined}
      style={mergeStyles(
        minItemWidth ? undefined : responsiveVars('grid-columns', columns, tracks),
        responsiveVars('grid-gap', gap, space),
        responsiveVars('grid-row-gap', rowGap, space),
        responsiveVars('grid-align', align, alignCss),
        style,
      )}
      {...rest}
    />
  )
})

export type GridSpan = GridColumns | 'full'

export interface GridItemProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /** Columns to span, or `full` for edge to edge. Responsive. */
  span?: Responsive<GridSpan>
  /** Column line to start on (1-based). Responsive. */
  start?: Responsive<GridColumns>
  as?: GridItemElement
}

/**
 * A cell that spans or starts somewhere specific. Plain children don't need it.
 *
 * <Grid.Item span={{ base: 'full', md: 8 }} start={{ md: 3 }}>…</Grid.Item>
 */
const GridItem = forwardRef<HTMLElement, GridItemProps>(function GridItem(
  { span, start, as: Comp = 'div', hideBelow, hideAbove, className, style, ...rest },
  ref,
) {
  return (
    <Comp
      // @ts-expect-error — polymorphic ref across a union of intrinsic elements is safe here
      ref={ref}
      className={cx(styles.item, visibilityClass({ hideBelow, hideAbove }), className)}
      style={mergeStyles(
        responsiveVars('grid-item-end', span, (s) => (s === 'full' ? '-1' : `span ${String(s)}`)),
        // `full` must also pin the start line to 1; an explicit `start` still wins.
        responsiveVars('grid-item-full', span, (s) => (s === 'full' ? '1' : 'auto')),
        responsiveVars('grid-item-start', start, String),
        style,
      )}
      {...rest}
    />
  )
})

/**
 * Two-dimensional layout, either with a column count per breakpoint or as an auto-fill grid that
 * needs no breakpoints.
 *
 * @remarks
 * `Grid` has two modes. With `columns`, you choose how many equal columns there are, per
 * breakpoint. With `minItemWidth`, the grid fits as many columns as there's room for, each at
 * least that wide, so it adapts to its container without a single breakpoint.
 *
 * @privateRemarks
 * Two-dimensional layout: either a fixed column count (responsive) or an
 * intrinsic auto-fill grid that needs no breakpoints at all.
 *
 * <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={5}>…</Grid>
 * <Grid minItemWidth="sm" gap={4}>…</Grid>
 */
export const Grid = Object.assign(GridRoot, { Item: GridItem })
