import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import type { CategoryColor } from '#utils/tokens'
import styles from './List.module.css'

export type ListDensity = 'compact' | 'regular'
export type ListElement = 'ul' | 'ol'
/** `surface` and `raised` set the list on one sheet, like `Card`'s `outline` and `raised`. */
export type ListSurface = 'none' | 'surface' | 'raised'

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /** Hairline rules between rows. Default `true`. */
  divided?: boolean
  /** Row height. Default `regular`. */
  density?: ListDensity
  /** `ol` when order is the content (a leaderboard). Default `ul`. */
  as?: ListElement
  /**
   * Set the rows on a sheet so they read as rows, not text on the page: `surface` is the
   * surface fill inside a hairline edge, `raised` stands on the theme's surface shadow. Rows run
   * edge to edge, clipped to the sheet's corners. Default `none`.
   */
  surface?: ListSurface
}

/**
 * The workhorse row list. Leading, content and trailing slots, divided by hairlines, never boxed
 * in cards.
 *
 * @remarks
 * `List` is for rows of similar things: trips, people, invoices, recent activity. Each row has up
 * to three slots: `List.Leading` (an avatar, an icon, a rank), `List.Content` (a title and
 * `List.Description`), and `List.Trailing` (an amount, a time, an action). Rows are divided by
 * hairlines.
 *
 * ## On a surface
 *
 * On a busy page, or a theme whose canvas has a texture, `surface="surface"` sets the whole list
 * on one sheet, and `surface="raised"` stands it on the theme's surface shadow. The rows stay rows
 * on it and run edge to edge: a highlighted, selected or hovered row is a band across the sheet,
 * and a categorical rail is the row's edge, following the sheet's corners at either end.
 *
 * @privateRemarks
 * The workhorse row list: leaderboards, team members, invoices, recent work. Rows are
 * `Leading · Content · Trailing`, divided by hairlines, never boxed in cards.
 *
 * <List><List.Item><List.Leading>1</List.Leading><List.Content>…</List.Content></List.Item></List>
 */
const ListRoot = forwardRef<HTMLUListElement, ListProps>(function List(
  { divided = true, density = 'regular', as: Comp = 'ul', surface = 'none', className, ...rest },
  ref,
) {
  return (
    <Comp
      // @ts-expect-error — ul/ol share HTMLOListElement-compatible attributes; ref type differs only nominally
      ref={ref}
      role="list"
      className={cx(styles.list, className)}
      data-divided={divided || undefined}
      data-density={density}
      data-surface={surface === 'none' ? undefined : surface}
      {...rest}
    />
  )
})

/**
 * Whether the row is the asChild link or button. Its slots are then spans, the only content a
 * button may hold; elsewhere they're divs, so block components (Stat, Stack) fit in them.
 */
const RowIsControl = createContext(false)

export interface ListItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'color'> {
  /** Hover affordance. Implied by `asChild`. */
  interactive?: boolean
  /**
   * Make the whole row one link or button: the single child becomes the row, so there
   * is exactly one interactive element and no nested anchors.
   * `<List.Item asChild><a href="/projects/atlas">…slots…</a></List.Item>`
   */
  asChild?: boolean
  /** The current item (accent-soft fill) — e.g. the open page in a list of links. */
  selected?: boolean
  /** Draw attention to a row with `--color-highlight` — typically "you". */
  highlighted?: boolean
  /** Out of play (eliminated, archived, past): every ink drops to the muted step, which still reads. */
  muted?: boolean
  /** A categorical colour drawn as a rail at the row's start: whose row it is, matching their `Tag`. */
  color?: CategoryColor
  children?: ReactNode
}

const ListItem = forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  {
    interactive = false,
    asChild = false,
    selected = false,
    highlighted = false,
    muted = false,
    color,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Row = asChild ? Slot.Root : 'div'
  return (
    <li
      ref={ref}
      className={cx(styles.item, className)}
      data-interactive={interactive || asChild || undefined}
      data-selected={selected || undefined}
      data-highlighted={highlighted || undefined}
      data-muted={muted || undefined}
      data-color={color}
      {...rest}
    >
      <RowIsControl.Provider value={asChild}>
        <Row className={styles.row}>{children}</Row>
      </RowIsControl.Provider>
    </li>
  )
})

/** Rank, avatar or icon at the start of the row. Numbers are tabular and right-aligned. */
const ListLeading = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function ListLeading(
  { className, ...rest },
  ref,
) {
  const Comp = useContext(RowIsControl) ? 'span' : 'div'
  // @ts-expect-error — polymorphic ref across span/div is safe here
  return <Comp ref={ref} className={cx(styles.leading, className)} {...rest} />
})

/** Title (the direct text) and an optional `List.Description` below it. */
const ListContent = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function ListContent(
  { className, ...rest },
  ref,
) {
  const Comp = useContext(RowIsControl) ? 'span' : 'div'
  // @ts-expect-error — polymorphic ref across span/div is safe here
  return <Comp ref={ref} className={cx(styles.content, className)} {...rest} />
})

const ListDescription = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function ListDescription({ className, ...rest }, ref) {
    const Comp = useContext(RowIsControl) ? 'span' : 'div'
    // @ts-expect-error — polymorphic ref across span/div is safe here
    return <Comp ref={ref} className={cx(styles.description, className)} {...rest} />
  },
)

/** Value, meta or actions at the end of the row. Numbers are tabular. */
const ListTrailing = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function ListTrailing(
  { className, ...rest },
  ref,
) {
  const Comp = useContext(RowIsControl) ? 'span' : 'div'
  // @ts-expect-error — polymorphic ref across span/div is safe here
  return <Comp ref={ref} className={cx(styles.trailing, className)} {...rest} />
})

export const List = Object.assign(ListRoot, {
  Item: ListItem,
  Leading: ListLeading,
  Content: ListContent,
  Description: ListDescription,
  Trailing: ListTrailing,
})
