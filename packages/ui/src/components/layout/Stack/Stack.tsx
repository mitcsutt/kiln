import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import { alignCss, space, type Align, type Space } from '#utils/tokens'
import styles from './Stack.module.css'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'

export type StackElement =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'ul'
  | 'ol'
  | 'li'
  | 'form'
  | 'fieldset'

export interface StackProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /** Space between children, as a step on the theme's space scale. Responsive. */
  gap?: Responsive<Space>
  /** Cross-axis alignment. Responsive. Default `stretch`. */
  align?: Responsive<Align>
  /** Draw a hairline rule between children (the rule sits in the middle of the gap). */
  dividers?: boolean
  /** Render as a different element. Lists get `role="list"` semantics preserved. */
  as?: StackElement
}

/**
 * A column of things with consistent space between them. The layout you'll reach for most.
 *
 * @remarks
 * `Stack` lays its children out vertically with a gap from the space scale. Most screens are
 * stacks of stacks, so most spacing in a Kiln app is a `gap` prop rather than a margin.
 *
 * ## Responsive gaps and elements
 *
 * `gap` and `align` take responsive values: `gap={{ base: 3, md: 4 }}`. Render a list with
 * `as="ul"` (or `ol`) and list semantics are kept even though the bullets are gone.
 *
 * @privateRemarks
 * Vertical flow. The most common layout: a column of things with consistent space.
 *
 * <Stack gap={{ base: 4, md: 6 }} dividers>…</Stack>
 */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    gap,
    align,
    dividers = false,
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
      className={cx(styles.stack, visibilityClass({ hideBelow, hideAbove }), className)}
      data-dividers={dividers || undefined}
      role={Comp === 'ul' || Comp === 'ol' ? 'list' : undefined}
      style={mergeStyles(
        responsiveVars('stack-gap', gap, space),
        responsiveVars('stack-align', align, alignCss),
        style,
      )}
      {...rest}
    />
  )
})
