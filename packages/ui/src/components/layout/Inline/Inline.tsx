import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import { alignCss, justifyCss, space, type Align, type Justify, type Space } from '#utils/tokens'
import styles from './Inline.module.css'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'

export type InlineElement = 'div' | 'span' | 'nav' | 'ul' | 'ol' | 'li' | 'header' | 'footer' | 'p'

export interface InlineProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /** Space between items (both axes when wrapping). Responsive. */
  gap?: Responsive<Space>
  /** Row gap when wrapped, if different from `gap`. Responsive. */
  rowGap?: Responsive<Space>
  /** Cross-axis alignment. Default `center`. Responsive. */
  align?: Responsive<Align>
  /** Main-axis distribution. Default `start`. Responsive. */
  justify?: Responsive<Justify>
  /** Wrap onto new lines. Default `true`. */
  wrap?: boolean
  as?: InlineElement
}

/**
 * Horizontal flow: button rows, tag lists, meta lines, toolbars.
 *
 * <Inline gap={3} justify={{ base: 'start', md: 'between' }}>…</Inline>
 */
export const Inline = forwardRef<HTMLElement, InlineProps>(function Inline(
  {
    gap,
    rowGap,
    align,
    justify,
    wrap = true,
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
      className={cx(styles.inline, visibilityClass({ hideBelow, hideAbove }), className)}
      data-wrap={wrap ? undefined : 'false'}
      role={Comp === 'ul' || Comp === 'ol' ? 'list' : undefined}
      style={mergeStyles(
        responsiveVars('inline-gap', gap, space),
        responsiveVars('inline-row-gap', rowGap, space),
        responsiveVars('inline-align', align, alignCss),
        responsiveVars('inline-justify', justify, justifyCss),
        style,
      )}
      {...rest}
    />
  )
})
