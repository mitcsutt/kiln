import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react'
import { cx } from '#utils/cx'
import styles from './Media.module.css'

export type MediaRatio = '1/1' | '4/3' | '3/2' | '16/9' | '21/9' | '3/4' | '2/3' | 'auto'
export type MediaFit = 'cover' | 'contain'
export type MediaRadius = 'none' | 'media' | 'surface'
/** Fixed heights for inline thumbnails: about 16, 20, 24, 32 and 96px. */
export type MediaSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface MediaProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  src: string
  /** Required. Describe the image; pass `""` only when it's purely decorative. */
  alt: string
  /** Frame ratio. The image is fitted inside. Default `auto` (the image's own ratio). */
  ratio?: MediaRatio
  /** Default `cover`. Use `contain` for logos, diagrams and screenshots that must not crop. */
  fit?: MediaFit
  /** Corner role. Default `media`. */
  radius?: MediaRadius
  /**
   * A fixed height, for a small image that sits inline beside text (a flag by a name, a logo
   * in a row). The width follows `ratio`, or the image's own ratio when `ratio` is `auto`.
   * Default: none, so the frame fills its container.
   */
  size?: MediaSize
  /** Renders a `<figure>` with this as its `<figcaption>`. */
  caption?: ReactNode
  /** Shown inside the frame if the image fails to load. Default: an empty sunken frame. */
  fallback?: ReactNode
  /** Default `lazy`. Use `eager` for the image above the fold. */
  loading?: 'lazy' | 'eager'
  /** Extra attributes for the `<img>` (srcSet, sizes, width/height, fetchPriority). */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading'>
}

/**
 * A framed image with a fixed ratio, lazy loading, a caption, and a calm failure state.
 *
 * @remarks
 * `Media` frames an image: it holds a ratio while loading, fits the image, loads lazily, and when
 * the image fails it keeps its shape and shows a quiet fallback instead of a broken-image icon.
 *
 * @privateRemarks
 * A framed image: fixed ratio, fitted, lazy by default, with a caption and a graceful
 * failure state. Screenshots, company logos, scanned documents.
 *
 * <Media src="/images/dashboard.png" alt="Revenue dashboard, September" ratio="16/9" caption="Dashboard, 2026" />
 */
export const Media = forwardRef<HTMLElement, MediaProps>(function Media(
  {
    src,
    alt,
    ratio = 'auto',
    fit = 'cover',
    radius = 'media',
    size,
    caption,
    fallback,
    loading = 'lazy',
    imgProps,
    className,
    ...rest
  },
  ref,
) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Reset when the source changes; also catch an error that fired before hydration.
  useEffect(() => {
    const img = imgRef.current
    setFailed(
      Boolean(
        img?.complete &&
        img.naturalWidth === 0 &&
        typeof img.currentSrc === 'string' &&
        img.currentSrc !== '',
      ),
    )
  }, [src])

  // A sized thumbnail is phrasing content (spans), so it can sit in a button or a line of text.
  const Root = caption !== undefined ? 'figure' : size ? 'span' : 'div'
  const Box = size ? 'span' : 'div'
  return (
    <Root
      // @ts-expect-error — polymorphic ref across figure/div is safe here
      ref={ref}
      className={cx(styles.media, className)}
      data-ratio={ratio}
      data-fit={fit}
      data-radius={radius}
      data-size={size}
      data-failed={failed || undefined}
      {...rest}
    >
      <Box className={styles.frame}>
        {failed ? (
          <Box
            className={styles.fallback}
            role={alt ? 'img' : undefined}
            aria-label={alt || undefined}
          >
            {fallback}
          </Box>
        ) : (
          <img
            ref={imgRef}
            className={styles.image}
            src={src}
            alt={alt}
            loading={loading}
            decoding="async"
            onError={() => {
              setFailed(true)
            }}
            {...imgProps}
          />
        )}
      </Box>
      {caption !== undefined ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </Root>
  )
})
