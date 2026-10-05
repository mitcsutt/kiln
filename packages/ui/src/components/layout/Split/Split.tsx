import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import { alignCss, space, type Align, type Space } from '#utils/tokens'
import styles from './Split.module.css'

/** First : second, on a 12-column basis. */
export type SplitRatio = '1/1' | '1/2' | '2/1' | '1/3' | '3/1' | '5/7' | '7/5' | '4/8' | '8/4'
export type SplitCollapse = 'sm' | 'md' | 'lg'
export type SplitElement = 'div' | 'section' | 'article' | 'header' | 'footer'

export interface SplitProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Width of the first child to the second. Default `5/7` — asymmetric on purpose. */
  ratio?: SplitRatio
  /** Stack the two children vertically below this breakpoint. Default `md`. */
  collapseBelow?: SplitCollapse
  /** Space between the two sides (and between them when stacked). Responsive. */
  gap?: Responsive<Space>
  /** Block-axis alignment of the two sides. Default `start`. Responsive. */
  align?: Responsive<Align>
  /** Put the second child first *visually* when split. DOM (and stacked) order is unchanged. */
  reverse?: boolean
  /** Exactly two children: the first and second side. */
  children: [ReactNode, ReactNode]
  as?: SplitElement
}

const columns = (ratio: SplitRatio, reverse: boolean): string => {
  const [a, b] = ratio.split('/')
  const [first, second] = reverse ? [b, a] : [a, b]
  return `minmax(0, ${String(first)}fr) minmax(0, ${String(second)}fr)`
}

/**
 * An asymmetric two-column layout that stacks on small screens. A heading beside its list, a label
 * beside its content.
 *
 * @remarks
 * `Split` takes exactly two children and puts them side by side in a ratio. Asymmetric splits read
 * as designed; a 50/50 split of a heading and a list rarely does. Below `collapseBelow` (`md` by
 * default) the two stack, first child on top.
 *
 * @privateRemarks
 * An asymmetric two-column layout: a heading beside its list, a label hang column,
 * media beside copy. Stacks below `collapseBelow`.
 *
 * <Split ratio="5/7" gap={{ base: 5, md: 7 }}>
 *   <Heading>Recent releases</Heading>
 *   <Stack dividers>…</Stack>
 * </Split>
 */
export const Split = forwardRef<HTMLElement, SplitProps>(function Split(
  {
    ratio = '5/7',
    collapseBelow = 'md',
    gap,
    align,
    reverse = false,
    as: Comp = 'div',
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Comp
      // @ts-expect-error — polymorphic ref across a union of intrinsic elements is safe here
      ref={ref}
      className={cx(styles.split, className)}
      data-ratio={ratio}
      data-collapse-below={collapseBelow}
      data-reverse={reverse || undefined}
      style={mergeStyles(
        { '--split-columns': columns(ratio, reverse) } as CSSProperties,
        responsiveVars('split-gap', gap, space),
        responsiveVars('split-align', align, alignCss),
        style,
      )}
      {...rest}
    >
      {children}
    </Comp>
  )
})
