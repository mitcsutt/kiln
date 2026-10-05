import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import styles from './AspectRatio.module.css'

export type AspectRatioPreset = '1/1' | '4/3' | '3/2' | '16/9' | '21/9' | '3/4'

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Width ÷ height, as a preset or a number (e.g. `1.91`). Default `16/9`. */
  ratio?: AspectRatioPreset | number
}

const toCss = (ratio: AspectRatioPreset | number): string =>
  typeof ratio === 'number' ? String(ratio) : ratio.replace('/', ' / ')

/**
 * A frame that keeps its proportions, for images, video, maps and charts.
 *
 * @remarks
 * `AspectRatio` holds a ratio as its width changes. Its child (an image, a video, an iframe, an
 * SVG) fills it and is cropped with `object-fit: cover`. It has no edge or radius of its own: wrap
 * it in `Media` or a `Card` for those.
 *
 * @privateRemarks
 * A frame that holds its proportions; its child (image, video, iframe, SVG) fills it
 * and is cropped with `object-fit: cover`. It has no edge or radius of its own —
 * wrap it (Media, Card) for that.
 *
 * <AspectRatio ratio="4/3"><img src="/images/dashboard.png" alt="Revenue dashboard" /></AspectRatio>
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = '16/9', className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(styles.frame, className)}
      style={mergeStyles({ '--aspect-ratio': toCss(ratio) } as CSSProperties, style)}
      {...rest}
    />
  )
})
