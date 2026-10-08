import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'
import styles from './ScrollArea.module.css'

export type ScrollAreaAxis = 'x' | 'y' | 'both'

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement>, VisibilityProps {
  /**
   * Names the area. With a name (this, or `aria-labelledby`) it becomes a labelled region that
   * keyboard users can focus and scroll with the arrow keys.
   */
  label?: string
  /**
   * Which way it scrolls. On `x` and `both` the content keeps its natural width, so a row of cards
   * scrolls instead of squeezing. `y` and `both` scroll once a parent gives the area a height (a
   * grid row, a pane). Default `x`.
   */
  axis?: ScrollAreaAxis
}

/**
 * A scroll container for content wider or taller than the page, such as a bracket, a timeline or
 * a wide board, that keyboard users can reach and scroll.
 *
 * @remarks
 * `ScrollArea` lets one wide thing scroll on its own instead of pushing the page sideways. Give it
 * a `label` and it's a named region in the tab order, so someone without a mouse or touch screen
 * can focus it and scroll with the arrow keys. The scrollbar takes the theme's line colour.
 *
 * A data table doesn't need one: `Table` scrolls sideways itself, and takes the same `label`.
 *
 * @privateRemarks
 * The labelled, focusable scroll wrapper Table already has, for anything that isn't a table
 * (axe's scrollable-region-focusable). Focusable only when named, so an unnamed one never adds
 * an anonymous tab stop. The eslint config allows tabIndex on role="region" for the same reason.
 *
 * <ScrollArea label="Knockout bracket"><Bracket /></ScrollArea>
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { label, axis = 'x', hideBelow, hideAbove, className, ...rest },
  ref,
) {
  const named = label !== undefined || rest['aria-labelledby'] !== undefined
  return (
    <div
      ref={ref}
      className={cx(styles.scrollArea, visibilityClass({ hideBelow, hideAbove }), className)}
      data-axis={axis}
      role={named ? 'region' : undefined}
      aria-label={label}
      tabIndex={named ? 0 : undefined}
      {...rest}
    />
  )
})
