import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import styles from './Prose.module.css'

export type ProseSize = 'sm' | 'md' | 'lg'
export type ProseElement = 'div' | 'article' | 'section'

export interface ProseProps extends HTMLAttributes<HTMLElement> {
  /** `md` (default) is the theme's `--prose-size`; `sm` for notes and sidebars, `lg` for essays. */
  size?: ProseSize
  as?: ProseElement
}

/**
 * Styles long-form writing from plain HTML or Markdown, in the theme's prose face, at a reading
 * measure.
 *
 * @remarks
 * `Prose` styles the raw elements inside it (headings, paragraphs, lists, quotes, code, tables,
 * figures) with a comfortable measure and a vertical rhythm from the space scale. Use it around
 * rendered Markdown or MDX, or any HTML you don't control. These docs' pages are `Prose`.
 *
 * @privateRemarks
 * Long-form writing. Styles raw HTML/MDX children — headings, lists, quotes, code,
 * figures, tables — in the theme's prose face with a comfortable measure and a
 * vertical rhythm from the space scale.
 *
 * <Prose as="article"><MDXContent /></Prose>
 */
export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose(
  { size = 'md', as: Comp = 'div', className, ...rest },
  ref,
) {
  return (
    <Comp
      // @ts-expect-error — polymorphic ref across a union of intrinsic elements is safe here
      ref={ref}
      className={cx(styles.prose, className)}
      data-size={size}
      {...rest}
    />
  )
})
