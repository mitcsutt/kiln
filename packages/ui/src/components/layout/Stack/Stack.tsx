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
