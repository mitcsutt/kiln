import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import { space, type Space } from '#utils/tokens'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'
import styles from './ActionBar.module.css'

export type ActionBarElement = 'div' | 'footer'
export type ActionBarAlign = 'start' | 'end' | 'between'

export interface ActionBarProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /** Where the actions sit on the row. Default `end`. */
  align?: ActionBarAlign
  /**
   * Pins the bar to the bottom of its scroll container — a canvas surface above a top
   * hairline, at `--z-sticky`. Use inside a scrolling form/dialog body so the primary
   * action stays reachable.
   */
  sticky?: boolean
  /** Space between actions. Responsive. Default `3`. */
  gap?: Responsive<Space>
  /** Render as `footer` when the bar is the form's own closing landmark. Default `div`. */
  as?: ActionBarElement
}

/**
 * The row of actions at the end of a form or dialog. Cancel, save, continue.
 *
 * @remarks
 * `ActionBar` is a row of buttons with consistent spacing and alignment: `end` by default,
 * `between` to push a destructive action to the other side, `start` to follow a form's left edge.
 *
 * @privateRemarks
 * A row of form/dialog actions — Cancel, Save, Submit. Composes with `Button`; doesn't
 * lay out anything else itself.
 *
 * <ActionBar sticky>
 *   <Button variant="ghost">Back</Button>
 *   <Button>Continue</Button>
 * </ActionBar>
 */
export const ActionBar = forwardRef<HTMLElement, ActionBarProps>(function ActionBar(
  {
    align = 'end',
    sticky = false,
    gap,
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
      className={cx(styles.bar, visibilityClass({ hideBelow, hideAbove }), className)}
      data-align={align}
      data-sticky={sticky || undefined}
      style={mergeStyles(responsiveVars('action-bar-gap', gap, space), style)}
      {...rest}
    />
  )
})
