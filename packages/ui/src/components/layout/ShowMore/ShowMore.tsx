import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import { space, type Space } from '#utils/tokens'
import { ChevronDownIcon } from '#icons'
import { useMergedRefs } from '#components/inputs/internal/refs'
import { useLatest } from '#components/inputs/internal/useLatest'
import { useHeightMotion } from '#components/layout/Collapse/useHeightMotion'
import styles from './ShowMore.module.css'

// Layout effects warn during server rendering; on the server nothing is measured.
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

export type ShowMoreMode = 'lines' | 'height' | 'items'

export interface ShowMoreProps extends HTMLAttributes<HTMLDivElement> {
  /** Clamp to this many lines of the content's text. For a description, a comment, a bio. */
  lines?: number
  /**
   * Clamp to this height, as a step on the space scale (`10` is `--space-10`). For anything that
   * isn't lines of text: a log excerpt, a block of prose with headings, a code sample.
   */
  maxHeight?: Space
  /**
   * Show only the first this-many items of the list it wraps (the children of its one child), and
   * say how many more there are. For tags, avatars, rows.
   */
  maxItems?: number
  /** Controlled state. */
  expanded?: boolean
  /** Uncontrolled initial state. Default `false`. */
  defaultExpanded?: boolean
  /** Runs when the toggle asks to expand or collapse. */
  onExpandedChange?: (expanded: boolean) => void
  /**
   * The toggle's label while clamped. A function receives how many items are hidden (with
   * `maxItems`; otherwise `0`). Default "Show more", or "Show 12 more" with `maxItems`.
   */
  moreLabel?: ReactNode | ((hidden: number) => ReactNode)
  /** The toggle's label while expanded. Default "Show less". */
  lessLabel?: ReactNode
}

function modeOf({ lines, maxHeight, maxItems }: ShowMoreProps): ShowMoreMode {
  if (maxItems !== undefined) return 'items'
  if (lines !== undefined) return 'lines'
  if (maxHeight !== undefined) return 'height'
  return 'lines'
}

/** On the server, a best guess at the item count: the children of the one wrapped element. */
function countItems(children: ReactNode): number {
  const only = Children.toArray(children)[0]
  if (!isValidElement<{ children?: ReactNode }>(only)) return 0
  return Children.count(only.props.children)
}

/** The line height of the content's first element, in px. */
function lineHeight(element: Element): number | undefined {
  const style = getComputedStyle(element)
  const value = parseFloat(style.lineHeight)
  if (Number.isFinite(value)) return value
  const size = parseFloat(style.fontSize)
  return Number.isFinite(size) ? size * 1.2 : undefined
}

/**
 * Clamps any content to a few lines, a height or a number of items, with a toggle to show the
 * rest.
 *
 * @remarks
 * `ShowMore` wraps the content it clamps, whatever it is: a `Text`, a `Prose` block, a list of
 * tags, a table, a code sample. None of those components takes a clamp prop of its own; you wrap
 * them in `ShowMore` instead, so the toggle looks and behaves the same everywhere.
 *
 * - `lines` clamps to that many lines of the content's text.
 * - `maxHeight` clamps to a height on the space scale.
 * - `maxItems` shows the first few items of the list it wraps and says how many more there are.
 *
 * The toggle only appears when the content is actually longer than the clamp, so short content
 * renders as it is. The cut fades out (with lines and a height) on any surface, and opening or
 * closing animates with the same motion as {@link Collapse | Collapse}.
 *
 * The toggle is a button with `aria-expanded`. Clamped text stays readable to screen readers, and
 * when keyboard focus lands on a link below the cut, the content opens so the focus is visible.
 * Hidden items (with `maxItems`) are out of the page until the toggle shows them.
 *
 * @privateRemarks
 * `maxItems` hides the wrapped list's children past N with one generated rule in a `<style>`
 * scoped by `data-show-more`, so the server render is already clamped. `lines` measures the
 * content's line height on the client; the server falls back to `1lh`.
 *
 * <ShowMore lines={3}><Text>{bio}</Text></ShowMore>
 */
export const ShowMore = forwardRef<HTMLDivElement, ShowMoreProps>(function ShowMore(props, ref) {
  const {
    lines,
    maxHeight,
    maxItems,
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    moreLabel,
    lessLabel = 'Show less',
    className,
    style,
    children,
    ...rest
  } = props
  const mode = modeOf(props)
  const id = useId()
  const contentId = `${id}-content`
  const root = useRef<HTMLDivElement>(null)
  const clip = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLSpanElement>(null)

  const [uncontrolled, setUncontrolled] = useState(defaultExpanded)
  const expanded = expandedProp ?? uncontrolled
  const change = useLatest(onExpandedChange)
  const setExpanded = useCallback(
    (next: boolean) => {
      if (expandedProp === undefined) setUncontrolled(next)
      change.current?.(next)
    },
    [expandedProp, change],
  )

  const [itemCount, setItemCount] = useState(() => countItems(children))
  const [tooLong, setTooLong] = useState(false)
  const [lineHeightPx, setLineHeightPx] = useState<number>()
  const overflowing = mode === 'items' ? itemCount > (maxItems ?? 0) : tooLong

  const measure = useCallback(() => {
    const content = clip.current
    if (!content) return
    const first = content.firstElementChild
    if (mode === 'items') {
      setItemCount(first ? first.children.length : 0)
      return
    }
    if (mode === 'lines' && first) {
      const height = lineHeight(first)
      if (height !== undefined) setLineHeightPx((prev) => (prev === height ? prev : height))
    }
    const clamp = probe.current?.getBoundingClientRect().height ?? 0
    setTooLong(clamp > 0 && content.scrollHeight > clamp + 1)
  }, [mode])

  useIsomorphicLayoutEffect(measure)

  useEffect(() => {
    const content = clip.current
    if (!content) return
    const observers: { disconnect: () => void }[] = []
    if (typeof ResizeObserver !== 'undefined') {
      const resize = new ResizeObserver(measure)
      resize.observe(content)
      if (content.firstElementChild) resize.observe(content.firstElementChild)
      observers.push(resize)
    }
    if (typeof MutationObserver !== 'undefined') {
      const mutation = new MutationObserver(measure)
      mutation.observe(content, { childList: true, subtree: mode === 'items' })
      observers.push(mutation)
    }
    return () => {
      for (const observer of observers) observer.disconnect()
    }
  }, [measure, mode])

  // Collapsing a long block can leave the reader below it: bring the top back into view.
  const collapsedByToggle = useRef(false)
  useHeightMotion(clip, expanded, (settled) => {
    if (settled || !collapsedByToggle.current) return
    collapsedByToggle.current = false
    const node = root.current
    if (node && node.getBoundingClientRect().top < 0) node.scrollIntoView({ block: 'start' })
  })

  const clamp =
    mode === 'height'
      ? space(maxHeight ?? 0)
      : mode === 'lines'
        ? lineHeightPx === undefined
          ? `calc(${String(lines ?? 3)} * 1lh)`
          : `${String((lines ?? 3) * lineHeightPx)}px`
        : 'none'

  const hidden = mode === 'items' ? Math.max(0, itemCount - (maxItems ?? 0)) : 0
  const more =
    typeof moreLabel === 'function'
      ? moreLabel(hidden)
      : (moreLabel ?? (mode === 'items' ? `Show ${String(hidden)} more` : 'Show more'))

  // Focus that lands below the cut opens the content, so the focused element is on screen.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (expanded || !overflowing || mode === 'items') return
    const box = event.currentTarget.getBoundingClientRect()
    const target = event.target.getBoundingClientRect()
    if (target.bottom > box.bottom + 1) setExpanded(true)
  }

  return (
    <div
      ref={useMergedRefs(ref, root)}
      className={cx(styles.showMore, className)}
      data-mode={mode}
      data-state={expanded ? 'expanded' : 'collapsed'}
      data-overflowing={overflowing || undefined}
      style={mergeStyles({ '--_clamp': clamp } as CSSProperties, style)}
      {...rest}
    >
      <span ref={probe} className={styles.probe} aria-hidden="true" />
      {mode === 'items' && !expanded ? (
        <style>{`[data-show-more="${id}"]>*>:nth-child(n+${String((maxItems ?? 0) + 1)}){display:none}`}</style>
      ) : null}
      <div
        ref={clip}
        id={contentId}
        className={styles.clip}
        data-show-more={mode === 'items' ? id : undefined}
        onFocus={onFocus}
      >
        {children}
      </div>
      {overflowing ? (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => {
            collapsedByToggle.current = expanded
            setExpanded(!expanded)
          }}
        >
          {expanded ? lessLabel : more}
          <ChevronDownIcon className={styles.chevron} />
        </button>
      ) : null}
    </div>
  )
})
