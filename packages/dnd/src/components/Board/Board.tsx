import { Badge, cx, Heading, type HeadingLevel } from '@mitcsutt/kiln-ui'
import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'

import { Dnd } from '#components/Dnd'
import { ListEntry } from '#components/internal/ListEntry'
import { useDndController } from '#core/context'
import type { DragEndEvent, DragInput, RootState } from '#core/controller'
import type { DndAnnouncements } from '#core/messages'
import { useStore } from '#core/store'
import { moveBetween, type ListPosition } from '#data/lists'
import { useDroppable } from '#hooks/useDroppable'

import styles from './Board.module.css'

/** One column of a `Board`. */
export interface BoardColumn {
  /** The key of its items in `items`. */
  id: string
  /** Its heading, and its name in announcements ("Doing"). */
  label: string
}

/** One move, as `Board`'s `onChange` reports it. */
export interface BoardMove<T> {
  /** The item that moved. */
  item: T
  /** Where it was: its column and index there. */
  from: ListPosition
  /** Where it is now. */
  to: ListPosition
  /** How it was moved. */
  input: DragInput
}

/** What `Board` passes to the function that renders each item. */
export interface BoardItemState {
  /** The item's column. */
  column: string
  /** Its index there, from 0. */
  index: number
  /** Whether it's being dragged. */
  isDragging: boolean
}

export interface BoardProps<T> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'defaultValue'
> {
  /** The columns, in order. */
  columns: readonly BoardColumn[]
  /** The items of each column, keyed by column id. Pass with `onChange` to control the board. */
  items?: Readonly<Record<string, readonly T[]>>
  /** The starting items for a board that keeps its own state. */
  defaultItems?: Readonly<Record<string, readonly T[]>>
  /** Called once per drop that moves an item, with every column's items and what moved. */
  onChange?: (items: Record<string, T[]>, move: BoardMove<T>) => void
  /** Renders one item. */
  children: (item: T, state: BoardItemState) => ReactNode
  /** The board's accessible name ("Release board"). */
  label: string
  /** Each item's name, as announcements and its handle say it. */
  getLabel: (item: T) => string
  /** Each item's id, unique across the board. Default: the item's `id` field. */
  getId?: (item: T) => string
  /** Items that can't be picked up. */
  isDisabled?: (item: T) => boolean
  /** Drag by a `DragHandle` inside each item instead of the whole item. */
  handle?: boolean
  /** The level of the column headings. Default 3. */
  headingLevel?: HeadingLevel
  /** Replace any of the words the board says (see `Dnd`). */
  announcements?: Partial<DndAnnouncements>
}

const defaultGetId = (item: unknown): string => {
  const id = (item as { id?: unknown } | null)?.id
  if (typeof id === 'string' || typeof id === 'number') return String(id)
  throw new Error('Board: give each item an `id`, or pass `getId`.')
}

const EMPTY: readonly never[] = []

function BoardInner<T>(
  {
    columns,
    items,
    defaultItems,
    onChange,
    children,
    label,
    getLabel,
    getId = defaultGetId,
    isDisabled,
    handle = false,
    headingLevel = 3,
    announcements,
    className,
    ...rest
  }: BoardProps<T>,
  forwardedRef: Ref<HTMLDivElement>,
) {
  const [own, setOwn] = useState<Readonly<Record<string, readonly T[]>>>(() => defaultItems ?? {})
  const current = items ?? own
  const scope = useId()

  const onDragEnd = useCallback(
    ({ item, target, input }: DragEndEvent) => {
      if (target?.kind !== 'list' || item.list === undefined || item.index === undefined) return
      const from = { column: item.list, index: item.index }
      const to = { column: target.list, index: target.index }
      const moved = current[from.column]?.[from.index]
      if (moved === undefined) return
      if (from.column === to.column && from.index === to.index) return
      const next = moveBetween(current, from, to)
      if (items === undefined) setOwn(next)
      onChange?.(next, { item: moved, from, to, input })
    },
    [current, items, onChange],
  )

  return (
    <Dnd announcements={announcements} onDragEnd={onDragEnd}>
      <div
        ref={forwardedRef}
        role="group"
        aria-label={label}
        {...rest}
        className={cx(styles.board, className)}
      >
        {columns.map((column) => {
          const columnItems = current[column.id] ?? EMPTY
          const headingId = `${scope}-${column.id}`
          return (
            <section key={column.id} className={styles.column} aria-labelledby={headingId}>
              <div className={styles.header}>
                <Heading id={headingId} level={headingLevel} size="sm">
                  {column.label}
                </Heading>
                <Badge>{columnItems.length}</Badge>
              </div>
              <BoardCards column={column} headingId={headingId} scope={scope}>
                {columnItems.map((item, index) => {
                  const id = getId(item)
                  return (
                    <ListEntry
                      key={id}
                      id={id}
                      label={getLabel(item)}
                      index={index}
                      list={column.id}
                      orientation="vertical"
                      handle={handle}
                      disabled={isDisabled?.(item) ?? false}
                      className={styles.card}
                    >
                      <BoardCardContent
                        render={children}
                        item={item}
                        id={id}
                        column={column.id}
                        index={index}
                      />
                    </ListEntry>
                  )
                })}
              </BoardCards>
            </section>
          )
        })}
      </div>
    </Dnd>
  )
}

/** A column's `ul`: the list container an item lands in, empty or past its last card. */
function BoardCards({
  column,
  headingId,
  scope,
  children,
}: {
  column: BoardColumn
  headingId: string
  scope: string
  children: ReactNode
}) {
  const { ref, isOver } = useDroppable({
    id: `${scope}-column-${column.id}`,
    label: column.label,
    list: column.id,
  })
  return (
    <ul
      ref={ref}
      role="list"
      aria-labelledby={headingId}
      className={styles.cards}
      data-over={isOver ? '' : undefined}
    >
      {children}
    </ul>
  )
}

function BoardCardContent<T>({
  render,
  item,
  id,
  column,
  index,
}: {
  render: (item: T, state: BoardItemState) => ReactNode
  item: T
  id: string
  column: string
  index: number
}) {
  const controller = useDndController('Board')
  const isDragging = useStore(
    controller.store,
    useCallback((state: RootState) => state.operation?.id === id, [id]),
  )
  return render(item, { column, index, isDragging })
}

/**
 * Columns of items you move within and between columns by dragging, by pointer, touch or
 * keyboard: a kanban board.
 *
 * @remarks
 * `Board` takes the columns in order and each column's items as a map,
 * `{ todo: […], doing: […] }`. A line shows where a dragged item will land, and the board
 * changes once, on drop, through `onChange`, which gets the whole new map. To move items
 * in your own code, use `moveBetween`.
 *
 * By keyboard, Space or Enter picks an item up. Up and Down move it within its column,
 * Left and Right move it to the next column, Space or Enter drops it and Escape puts it
 * back. Each step is announced with the column's name ("Fix the export button moved to
 * position 1 of 3 in Doing").
 *
 * Each column has a heading (level 3 unless you set `headingLevel`) and a count. An empty
 * column still takes drops.
 */
export const Board = forwardRef(BoardInner) as <T>(
  props: BoardProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement
