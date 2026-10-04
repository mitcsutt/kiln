import { forwardRef, type HTMLAttributes, type LiHTMLAttributes, type ReactNode } from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import styles from './List.module.css'

export type ListDensity = 'compact' | 'regular'
export type ListElement = 'ul' | 'ol'

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /** Hairline rules between rows. Default `true`. */
  divided?: boolean
  /** Row height. Default `regular`. */
  density?: ListDensity
  /** `ol` when order is the content (a leaderboard). Default `ul`. */
  as?: ListElement
}

/**
 * The workhorse row list: leaderboards, squads, transactions, recent work. Rows are
 * `Leading · Content · Trailing`, divided by hairlines, never boxed in cards.
 *
 * <List><List.Item><List.Leading>1</List.Leading><List.Content>…</List.Content></List.Item></List>
 */
const ListRoot = forwardRef<HTMLUListElement, ListProps>(function List(
  { divided = true, density = 'regular', as: Comp = 'ul', className, ...rest },
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
      {...rest}
    />
  )
})

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /** Hover affordance. Implied by `asChild`. */
  interactive?: boolean
  /**
   * Make the whole row one link or button: the single child becomes the row, so there
   * is exactly one interactive element and no nested anchors.
   * `<List.Item asChild><a href="/team/mexico">…slots…</a></List.Item>`
   */
  asChild?: boolean
  /** The current item (accent-soft fill) — e.g. the open page in a list of links. */
  selected?: boolean
  /** Draw attention to a row with `--color-highlight` — typically "you". */
  highlighted?: boolean
  children?: ReactNode
}

const ListItem = forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  {
    interactive = false,
    asChild = false,
    selected = false,
    highlighted = false,
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
      {...rest}
    >
      <Row className={styles.row}>{children}</Row>
    </li>
  )
})

/** Rank, avatar or icon at the start of the row. Numbers are tabular and right-aligned. */
const ListLeading = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ListLeading({ className, ...rest }, ref) {
    return <span ref={ref} className={cx(styles.leading, className)} {...rest} />
  },
)

/** Title (the direct text) and an optional `List.Description` below it. */
const ListContent = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ListContent({ className, ...rest }, ref) {
    return <span ref={ref} className={cx(styles.content, className)} {...rest} />
  },
)

const ListDescription = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ListDescription({ className, ...rest }, ref) {
    return <span ref={ref} className={cx(styles.description, className)} {...rest} />
  },
)

/** Value, meta or actions at the end of the row. Numbers are tabular. */
const ListTrailing = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ListTrailing({ className, ...rest }, ref) {
    return <span ref={ref} className={cx(styles.trailing, className)} {...rest} />
  },
)

export const List = Object.assign(ListRoot, {
  Item: ListItem,
  Leading: ListLeading,
  Content: ListContent,
  Description: ListDescription,
  Trailing: ListTrailing,
})
