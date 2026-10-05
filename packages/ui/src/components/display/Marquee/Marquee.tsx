import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { createIcon } from '#icons'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import { space, type Space } from '#utils/tokens'
import styles from './Marquee.module.css'

export type MarqueeSpeed = 'slow' | 'normal' | 'fast'
export type MarqueeDirection = 'left' | 'right'
export type MarqueeSurface = 'plain' | 'inverse' | 'accent'

export interface MarqueeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The things that scroll. Pass an array (or several children) — each entry becomes
   * one item with a separator after it, so the loop is seamless.
   */
  items?: ReactNode[]
  /** Alternative to `items`: each direct child is one item. */
  children?: ReactNode
  /** Accessible name for the region, e.g. "Deploy status". Required: a ticker needs a name. */
  label: string
  /** Travel speed. Measured in px/s once mounted, so long and short tickers feel the same. */
  speed?: MarqueeSpeed
  /** Which way the content travels. Default `left`. */
  direction?: MarqueeDirection
  /** Pause while hovered or while anything inside has focus. Default `true`. */
  pauseOnHover?: boolean
  /**
   * Show a pause/play button at the end of the band (WCAG 2.2.2: moving content needs a
   * way to stop it that works for keyboard and touch). Default `true`.
   */
  pauseControl?: boolean
  /** Space between an item and its separator, as a step on the space scale. Default 5. */
  gap?: Space
  /**
   * Replaces the separator drawn between items. The default is a slanted hairline
   * themed through `--marquee-separator-*`. Pass `null` for none.
   */
  separator?: ReactNode
  /** Band colour. `plain` sits on the page between hairlines; `inverse` and `accent` fill. */
  surface?: MarqueeSurface
}

/* Pixels per second. Tuned so text stays readable at a glance. */
const SPEED: Record<MarqueeSpeed, number> = { slow: 28, normal: 48, fast: 84 }
/* Seconds per item, used before the track has been measured (and on the server). */
const FALLBACK_PER_ITEM: Record<MarqueeSpeed, number> = { slow: 7, normal: 4.5, fast: 2.5 }

const PauseIcon = createIcon('PauseIcon', <path d="M7.5 5.5v9M12.5 5.5v9" />)
const PlayIcon = createIcon('PlayIcon', <path d="M7 5.25v9.5L14.75 10z" />)

/**
 * A horizontal ticker for live updates, with a pause control, that stops for reduced motion.
 *
 * @remarks
 * `Marquee` scrolls a row of items in a loop, like live departures along a station board. The
 * content is rendered twice for a seamless loop, but the copy is `aria-hidden` and inert, so
 * screen readers and the tab order meet it once.
 *
 * @privateRemarks
 * A horizontal ticker: live status, a features strip, a top-accounts summary.
 *
 * The content is rendered twice for a seamless loop; the copy is `aria-hidden` and
 * `inert`, so screen readers and the tab order see it once. Under
 * `prefers-reduced-motion` the band stops and becomes a scrollable row.
 *
 * <Marquee label="Deploy status" items={[<>Atlas 2.4 deploying</>, …]} surface="inverse" />
 */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(function Marquee(
  {
    items,
    children,
    label,
    speed = 'normal',
    direction = 'left',
    pauseOnHover = true,
    pauseControl = true,
    gap = 5,
    separator,
    surface = 'plain',
    className,
    style,
    ...rest
  },
  ref,
) {
  const list = (items ?? Children.toArray(children)).filter(
    (item) => item !== null && item !== undefined && item !== false,
  )
  const [paused, setPaused] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)
  const groupRef = useRef<HTMLUListElement>(null)

  // Measure one copy of the content and derive the loop duration from a constant speed.
  useEffect(() => {
    const group = groupRef.current
    if (!group || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const width = group.getBoundingClientRect().width
      if (width > 0) setDuration(width / SPEED[speed])
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(group)
    return () => {
      observer.disconnect()
    }
  }, [speed])

  // `inert` is only a known prop in React 19, so set the attribute directly (works in 18 too).
  const inertRef = useCallback((node: HTMLUListElement | null) => {
    node?.setAttribute('inert', '')
  }, [])

  const seconds = duration ?? Math.max(list.length, 1) * FALLBACK_PER_ITEM[speed]

  const renderSeparator = () =>
    separator === undefined ? (
      <span className={styles.rule} />
    ) : separator === null ? null : (
      <span className={styles.custom}>{separator}</span>
    )

  const renderGroup = () =>
    list.map((item, i) => (
      <li key={isValidElement(item) && item.key !== null ? item.key : i} className={styles.item}>
        <span className={styles.content}>{item}</span>
        <span className={styles.separator} aria-hidden="true">
          {renderSeparator()}
        </span>
      </li>
    ))

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      className={cx(styles.marquee, className)}
      data-surface={surface}
      data-direction={direction}
      data-speed={speed}
      data-pause-on-hover={pauseOnHover || undefined}
      data-paused={paused || undefined}
      style={mergeStyles(
        {
          '--marquee-gap': space(gap),
          '--marquee-duration': `${seconds.toFixed(2)}s`,
        } as CSSProperties,
        style,
      )}
      {...rest}
    >
      <div className={styles.viewport}>
        <div className={styles.track}>
          <ul ref={groupRef} role="list" className={styles.group}>
            {renderGroup()}
          </ul>
          <ul
            ref={inertRef}
            role="list"
            className={cx(styles.group, styles.copy)}
            aria-hidden="true"
          >
            {renderGroup()}
          </ul>
        </div>
      </div>
      {pauseControl ? (
        <button
          type="button"
          className={styles.control}
          aria-pressed={paused}
          aria-label={`Pause ${label}`}
          onClick={() => {
            setPaused((p) => !p)
          }}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      ) : null}
    </div>
  )
})
