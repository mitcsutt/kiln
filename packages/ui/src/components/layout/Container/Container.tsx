import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import type { Width } from '#utils/tokens'
import styles from './Container.module.css'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'

export type ContainerElement = 'div' | 'section' | 'main' | 'header' | 'footer' | 'article' | 'nav'

export interface ContainerProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /**
   * Maximum content width: `narrow` 32rem · `text` 42rem (prose measure) ·
   * `content` 68rem (default) · `wide` 84rem · `full` (no maximum).
   */
  width?: Width
  /** Keep the fluid page gutter on either side. Default `true`. */
  gutter?: boolean
  as?: ContainerElement
}

/**
 * Centres content at a readable maximum width with a fluid gutter. The gutter sits
 * outside the width, so `width="text"` is always a true prose measure.
 *
 * <Container width="text">…</Container>
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { width = 'content', gutter = true, as: Comp = 'div', hideBelow, hideAbove, className, ...rest },
  ref,
) {
  return (
    <Comp
      // @ts-expect-error — polymorphic ref across a union of intrinsic elements is safe here
      ref={ref}
      className={cx(styles.container, visibilityClass({ hideBelow, hideAbove }), className)}
      data-width={width}
      data-gutter={gutter ? undefined : 'false'}
      {...rest}
    />
  )
})
