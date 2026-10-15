import { cx } from '@mitcsutt/kiln-ui'
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
import type { DragEndEvent, DragInput, ListOrientation, RootState } from '#core/controller'
import type { DndAnnouncements } from '#core/messages'
import { useStore } from '#core/store'
import { arrayMove } from '#data/lists'
import { useDroppable } from '#hooks/useDroppable'

import styles from './Sortable.module.css'

/** One reorder, as `Sortable`'s `onChange` reports it. */
export interface SortableMove<T> {
  /** The item that moved. */
  item: T
  /** Its index before, from 0. */
  from: number
  /** Its index now, from 0. */
  to: number
  /** How it was moved. */
  input: DragInput
}

/** What `Sortable` passes to the function that renders each item. */
export interface SortableItemState {
  /** The item's index, from 0. */
  index: number
  /** Whether it's being dragged. */
  isDragging: boolean
}

export interface SortableProps<T> extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'children' | 'onChange' | 'defaultValue'
> {
  /** The items, in order. Pass with `onChange` to control the list. */
  items?: readonly T[]
  /** The starting items for a list that keeps its own order. */
  defaultItems?: readonly T[]
  /** Called once per drop that changes the order, with the new array and what moved. */
  onChange?: (items: T[], move: SortableMove<T>) => void
  /** Renders one item. */
  children: (item: T, state: SortableItemState) => ReactNode
  /** The list's accessible name ("Release checklist"). */
  label: string
  /** Each item's name, as announcements and its handle say it. */
  getLabel: (item: T) => string
  /** Each item's id, unique in the list. Default: the item's `id` field. */
  getId?: (item: T) => string
  /** Items that can't be picked up. They still shift as others move around them. */
  isDisabled?: (item: T) => boolean
  /** `vertical` (default) for a column of rows; `horizontal` for a row of items. */
  orientation?: ListOrientation
  /**
   * Drag by a `DragHandle` inside each item instead of the whole item. Use it whenever the
   * items hold links, buttons or fields.
   */
  handle?: boolean
  /** Replace any of the words the list says (see `Dnd`). */
  announcements?: Partial<DndAnnouncements>
}

const defaultGetId = (item: unknown): string => {
  const id = (item as { id?: unknown } | null)?.id
  if (typeof id === 'string' || typeof id === 'number') return String(id)
  throw new Error('Sortable: give each item an `id`, or pass `getId`.')
}

function SortableInner<T>(
  {
    items,
    defaultItems,
    onChange,
    children,
    label,
    getLabel,
    getId = defaultGetId,
    isDisabled,
    orientation = 'vertical',
    handle = false,
    announcements,
    className,
    ...rest
  }: SortableProps<T>,
  forwardedRef: Ref<HTMLUListElement>,
) {
  const [own, setOwn] = useState<readonly T[]>(() => defaultItems ?? [])
  const current = items ?? own
  const list = useId()

  const onDragEnd = useCallback(
    ({ item, target, input }: DragEndEvent) => {
      if (target?.kind !== 'list' || item.index === undefined) return
      const from = item.index
      const moved = current[from]
      if (moved === undefined || from === target.index) return
      const next = arrayMove(current, from, target.index)
      if (items === undefined) setOwn(next)
      onChange?.(next, { item: moved, from, to: target.index, input })
    },
    [current, items, onChange],
  )

  return (
    <Dnd announcements={announcements} onDragEnd={onDragEnd}>
      <SortableList
        ref={forwardedRef}
        {...rest}
        list={list}
        label={label}
        orientation={orientation}
        className={className}
      >
        {current.map((item, index) => {
          const id = getId(item)
          const disabled = isDisabled?.(item) ?? false
          return (
            <ListEntry
              key={id}
              id={id}
              label={getLabel(item)}
              index={index}
              list={list}
              orientation={orientation}
              handle={handle}
              disabled={disabled}
              className={styles.item}
            >
              <SortableItemContent render={children} item={item} index={index} id={id} />
            </ListEntry>
          )
        })}
      </SortableList>
    </Dnd>
  )
}

interface SortableListProps extends HTMLAttributes<HTMLUListElement> {
  list: string
  label: string
  orientation: ListOrientation
}

/** The `ul`: the list's drop target, so an item can land after the last row. */
const SortableList = forwardRef<HTMLUListElement, SortableListProps>(function SortableList(
  { list, label, orientation, className, children, ...rest },
  forwardedRef,
) {
  const droppable = useDroppable({ id: `${list}-container`, label, list, orientation })
  const { ref: droppableRef } = droppable
  const ref = useCallback(
    (node: HTMLUListElement | null) => {
      droppableRef(node)
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [droppableRef, forwardedRef],
  )
  return (
    <ul
      ref={ref}
      role="list"
      aria-label={label}
      {...rest}
      className={cx(styles.list, className)}
      data-orientation={orientation}
    >
      {children}
    </ul>
  )
})

function SortableItemContent<T>({
  render,
  item,
  index,
  id,
}: {
  render: (item: T, state: SortableItemState) => ReactNode
  item: T
  index: number
  id: string
}) {
  // Reading the drag state here, not in Sortable, keeps a drag from re-rendering every row.
  const isDragging = useIsDragging(id)
  return render(item, { index, isDragging })
}

function useIsDragging(id: string): boolean {
  const controller = useDndController('Sortable')
  return useStore(
    controller.store,
    useCallback((state: RootState) => state.operation?.id === id, [id]),
  )
}

/**
 * A list you reorder by dragging, by pointer, touch or keyboard.
 *
 * @remarks
 * `Sortable` renders a list of rows. Nothing moves while an item is dragged: a line shows
 * where it will land, and the list reorders once, on drop, through `onChange`. By
 * keyboard, Space or Enter picks an item up, the arrow keys move it, Space or Enter drops
 * it and Escape puts it back, and each step is announced ("Write release notes moved to
 * position 3 of 5").
 *
 * Pass `items` and `onChange` to own the order, or `defaultItems` to let the list keep
 * it. `onChange` gets the new array, so `setItems` is usually all it needs. To move items
 * in your own code, use `arrayMove`.
 *
 * Without `handle`, the whole row is the handle. With `handle`, put a `DragHandle` in each
 * row; the rest of the row keeps its own clicks and keys.
 */
export const Sortable = forwardRef(SortableInner) as <T>(
  props: SortableProps<T> & { ref?: Ref<HTMLUListElement> },
) => ReactElement
