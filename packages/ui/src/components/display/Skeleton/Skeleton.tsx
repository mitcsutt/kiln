import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import { space, type Space } from '#utils/tokens'
import styles from './Skeleton.module.css'

/** A fraction of the container, or a step on the space scale. */
export type SkeletonWidth = 'full' | '3/4' | '2/3' | '1/2' | '1/3' | '1/4' | Space
/** A text line, a heading line, a control, a block — or a step on the space scale. */
export type SkeletonHeight = 'text' | 'heading' | 'control' | 'block' | Space
export type SkeletonRadius = 'field' | 'surface' | 'media' | 'chip'

const FRACTION: Record<Exclude<SkeletonWidth, Space>, string> = {
  full: '100%',
  '3/4': '75%',
  '2/3': '66.667%',
  '1/2': '50%',
  '1/3': '33.333%',
  '1/4': '25%',
}

const widthCss = (w: SkeletonWidth) => (typeof w === 'number' ? space(w) : FRACTION[w])
const heightCss = (h: SkeletonHeight) =>
  typeof h === 'number'
    ? space(h)
    : h === 'text'
      ? '1lh'
      : h === 'heading'
        ? 'calc(var(--text-xl) * var(--leading-snug))'
        : h === 'control'
          ? 'var(--control-md)'
          : 'var(--space-9)'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Default `full`. */
  width?: SkeletonWidth
  /** Default `text` (one line of the surrounding text). */
  height?: SkeletonHeight
  /** Default `field`. */
  radius?: SkeletonRadius
  /** Render a paragraph of this many lines instead of one block (same as `Skeleton.Text`). */
  lines?: number
}

/**
 * Placeholder shapes for content on its way, hidden from assistive technology.
 *
 * @remarks
 * `Skeleton` holds the shape of content while it loads, so the page doesn't jump when it arrives.
 * `Skeleton.Text` is lines of text, `Skeleton.Circle` is an avatar, and `Skeleton` itself is a
 * block with a `width` and `height`.
 *
 * @privateRemarks
 * Placeholder for content that's on its way. Every piece is `aria-hidden`: announce
 * loading once on the region that's loading (`aria-busy`, or a `Spinner` label), not per bar.
 *
 * <Skeleton width="1/2" height="heading" />
 * <Skeleton.Text lines={3} />
 * <Skeleton.Circle size="md" />
 */
const SkeletonRoot = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width = 'full', height = 'text', radius = 'field', lines, className, style, ...rest },
  ref,
) {
  if (lines !== undefined)
    return <SkeletonText ref={ref} lines={lines} className={className} style={style} {...rest} />
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cx(styles.skeleton, className)}
      data-radius={radius}
      style={mergeStyles(
        {
          '--skeleton-width': widthCss(width),
          '--skeleton-height': heightCss(height),
        } as CSSProperties,
        style,
      )}
      {...rest}
    />
  )
})

export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of lines. The last one is shorter, like the end of a paragraph. Default 3. */
  lines?: number
  /** Space between lines. Default: the gap of real body text. */
  gap?: Space
}

const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(function SkeletonText(
  { lines = 3, gap, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cx(styles.text, className)}
      style={mergeStyles(
        gap !== undefined ? ({ '--skeleton-gap': space(gap) } as CSSProperties) : undefined,
        style,
      )}
      {...rest}
    >
      {Array.from({ length: Math.max(1, lines) }, (_, i) => (
        <div key={i} className={cx(styles.skeleton, styles.line)} data-radius="field" />
      ))}
    </div>
  )
})

export interface SkeletonCircleProps extends HTMLAttributes<HTMLDivElement> {
  /** Matches control heights: sm 32 · md 40 · lg 48 (× density). Default `md`. */
  size?: 'sm' | 'md' | 'lg'
}

/** Avatar placeholder. Follows the theme's avatar shape, so it's a rounded square in Monograph. */
const SkeletonCircle = forwardRef<HTMLDivElement, SkeletonCircleProps>(function SkeletonCircle(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cx(styles.skeleton, styles.circle, className)}
      data-size={size}
      {...rest}
    />
  )
})

export const Skeleton = Object.assign(SkeletonRoot, { Text: SkeletonText, Circle: SkeletonCircle })
