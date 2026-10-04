import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import { space, type Space } from '#utils/tokens'
import styles from './Section.module.css'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'

export type SectionElement = 'section' | 'div' | 'article' | 'aside' | 'header' | 'footer'
export type SectionSurface = 'canvas' | 'surface' | 'sunken' | 'inverse' | 'accent'
export type SectionDivider = 'top' | 'bottom' | 'both'

export interface SectionProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /**
   * Block padding (top and bottom), as a step on the space scale. Responsive.
   * Vary it: adjacent sections should not share the same step. Default `8`.
   */
  space?: Responsive<Space>
  /**
   * Full-bleed band colour. Omit to stay transparent on the canvas. `inverse` and
   * `accent` re-point the ink, line and focus colours so children stay legible.
   */
  surface?: SectionSurface
  /** A hairline across the full bleed at the top, bottom or both edges. */
  divider?: SectionDivider
  as?: SectionElement
}

/**
 * A full-bleed band of vertical rhythm. Put a `Container` inside for width.
 *
 * <Section space={{ base: 7, md: 9 }} surface="sunken" divider="both">
 *   <Container>…</Container>
 * </Section>
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    space: spaceProp,
    surface,
    divider,
    as: Comp = 'section',
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
      className={cx(styles.section, visibilityClass({ hideBelow, hideAbove }), className)}
      data-surface={surface}
      data-divider={divider}
      style={mergeStyles(responsiveVars('section-space', spaceProp, space), style)}
      {...rest}
    />
  )
})
