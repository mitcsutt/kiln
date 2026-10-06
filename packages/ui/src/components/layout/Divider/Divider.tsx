import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import { space, type Space } from '#utils/tokens'
import styles from './Divider.module.css'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'

export type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>, VisibilityProps {
  /** Default `horizontal`. A vertical rule stretches to its flex/grid row. */
  orientation?: DividerOrientation
  /** Heavier rule in `--color-line-strong` at `--border-width-strong`. */
  strong?: boolean
  /** Text set into a horizontal rule, e.g. "Earlier this week". It also names the separator. */
  label?: ReactNode
  /** Where the label sits. Default `start` (left-aligned by default); `center` for a lone break. */
  labelPosition?: 'start' | 'center'
  /** Margin on both sides of the rule (block axis if horizontal, inline if vertical). */
  spacing?: Space
  /**
   * Purely visual: hide it from assistive tech. Use when the rule only repeats a
   * boundary that headings or landmarks already convey.
   */
  decorative?: boolean
}

/**
 * A hairline rule between groups of content, optionally labelled, horizontal or vertical.
 *
 * @remarks
 * `Divider` separates groups. For a rule between every item of a list, use `Stack dividers`
 * instead, which spaces the rules for you.
 *
 * @privateRemarks
 * A hairline rule between groups of content. Prefer `Stack dividers` for rules
 * between every item of a list.
 *
 * <Divider label="Earlier this week" spacing={6} />
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    strong = false,
    label,
    labelPosition = 'start',
    spacing,
    decorative = false,
    hideBelow,
    hideAbove,
    className,
    style,
    ...rest
  },
  ref,
) {
  const labelId = useId()
  const hasLabel =
    label !== undefined && label !== null && label !== false && orientation === 'horizontal'
  return (
    <div
      ref={ref}
      className={cx(styles.divider, visibilityClass({ hideBelow, hideAbove }), className)}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={!decorative && orientation === 'vertical' ? 'vertical' : undefined}
      aria-labelledby={!decorative && hasLabel ? labelId : undefined}
      data-orientation={orientation}
      data-strong={strong || undefined}
      data-label-position={hasLabel ? labelPosition : undefined}
      style={mergeStyles(
        spacing === undefined
          ? undefined
          : ({ '--divider-spacing': space(spacing) } as CSSProperties),
        style,
      )}
      {...rest}
    >
      {hasLabel ? (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      ) : null}
    </div>
  )
})
