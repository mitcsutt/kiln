import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
} from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import { space, type Space, type Tone } from '#utils/tokens'
import { joinIds } from '#components/inputs/internal/refs'
import { Swatch, type SwatchColor } from '#components/display/Swatch'
import styles from './Indicator.module.css'

export type IndicatorPosition = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
export type IndicatorShape = 'rect' | 'round' | 'avatar'

export interface IndicatorProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'color'
> {
  /**
   * The element the mark is pinned to: an `IconButton`, an `Avatar`, a link. It must accept
   * `aria-describedby`, which carries `label`. Omit it to show the mark on its own, in the flow.
   */
  children?: ReactElement
  /**
   * What the mark means, said in full: "3 unread messages", "Waiting for your answer". It's added
   * to the child's accessible description, so the child is announced as "Inbox, 3 unread messages"
   * rather than a bare number. Required, because a dot or a number alone is not information.
   */
  label: string
  /** A number to show. Without it the mark is a dot. */
  count?: number
  /** The largest count shown in full. Above it the mark reads "99+". Default `99`. */
  max?: number
  /** Show the mark when `count` is `0`. Hidden by default, since nothing is waiting. */
  showZero?: boolean
  /** Hide the mark (and its description) without unmounting the child. */
  invisible?: boolean
  /** Colour of the mark, from the shared tone set. Default `accent`. */
  tone?: Tone
  /**
   * Draw the mark as a colour swatch dot instead: identity, like a team's colour on an avatar,
   * never status. A categorical slot (`1` to `8`) or a CSS colour from data. `count` and `tone`
   * don't apply.
   */
  swatch?: SwatchColor
  /** A slow ring swells out of the mark, for something in progress. It stills under reduced motion. */
  processing?: boolean
  /** Which corner, in the reading direction: `top-end` (default) is top right in English. */
  position?: IndicatorPosition
  /**
   * The child's outline, so the mark sits on its edge rather than in the empty corner of its box.
   * `rect` (default) for square-cornered children, `round` for circles (a round `IconButton`),
   * `avatar` to follow the theme's avatar radius.
   */
  shape?: IndicatorShape
  /** Move the mark in toward the child's centre by a space step, for a child with an empty edge. */
  offset?: Space
}

const formatCount = (count: number, max: number) =>
  count > max ? `${String(max)}+` : String(count)

/**
 * A count or a dot pinned to the corner of another element: unread messages on a button, a
 * waiting dot on an avatar.
 *
 * @remarks
 * `Indicator` wraps one element and places a small mark on its edge. With `count` it's a number,
 * capped at `max` ("99+"), and hidden at zero unless you pass `showZero`. Without it, it's a dot.
 * `invisible` hides the mark without moving or remounting the child.
 *
 * The mark is hidden from screen readers. What it means is `label`, which is added to the
 * child's accessible description, so give the child its own name (an `IconButton`'s `label`, an
 * `Avatar`'s `name`) and write `label` as the rest of the sentence.
 *
 * `position` is logical, so `top-end` is the top left in a right-to-left page. `shape` keeps the
 * mark on the outline of a round child instead of floating in the corner of its box, and `offset`
 * moves it in toward a child whose visible edge is inside its box, like a ghost `IconButton`.
 *
 * ## When it changes
 *
 * An `Indicator` doesn't announce changes: a count that speaks every time it ticks is noise.
 * Where a change matters, such as a reply arriving, announce it where it happens. `processing`
 * pulses a ring for something under way, and stills under reduced motion.
 *
 * @privateRemarks
 * The tone colours match StatusDot and Badge's solid fill, the pulse is LiveIndicator's, and a
 * `swatch` mark is the shared Swatch part, so the dots in the system stay one family.
 */
export const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(function Indicator(
  {
    children,
    label,
    count,
    max = 99,
    showZero = false,
    invisible = false,
    tone = 'accent',
    swatch,
    processing = false,
    position = 'top-end',
    shape = 'rect',
    offset,
    className,
    style,
    ...rest
  },
  ref,
) {
  const labelId = useId()
  const hasCount = swatch === undefined && count !== undefined
  const shown = !invisible && !(hasCount && count === 0 && !showZero)
  const pinned = isValidElement<{ 'aria-describedby'?: string }>(children)

  const mark = shown ? (
    swatch !== undefined ? (
      <Swatch
        color={swatch}
        className={styles.mark}
        data-kind="swatch"
        data-processing={processing || undefined}
      />
    ) : (
      <span
        className={styles.mark}
        data-kind={hasCount ? 'count' : 'dot'}
        data-tone={tone}
        data-processing={processing || undefined}
        aria-hidden="true"
      >
        {hasCount ? formatCount(count, max) : null}
      </span>
    )
  ) : null

  return (
    <span
      ref={ref}
      className={cx(styles.indicator, className)}
      data-position={position}
      data-shape={shape}
      data-pinned={pinned || undefined}
      style={mergeStyles(
        offset ? ({ '--_offset': space(offset) } as CSSProperties) : undefined,
        style,
      )}
      {...rest}
    >
      {pinned
        ? cloneElement(children, {
            'aria-describedby': joinIds(
              children.props['aria-describedby'],
              shown ? labelId : undefined,
            ),
          })
        : null}
      {mark}
      {shown ? (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      ) : null}
    </span>
  )
})
