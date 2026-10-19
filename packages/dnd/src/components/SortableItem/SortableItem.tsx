import type { ReactNode } from 'react'

import { HandleContext } from '#components/DragHandle'
import type { DragInput, ListOrientation } from '#core/controller'
import type { DragHandleAttributes } from '#core/useDragSource'
import { useSortable, type UseSortableOptions } from '#hooks/useSortable'

import styles from './SortableItem.module.css'

/** The props `SortableItem` hands its element: kiln-dnd's look, and the drag props without a handle. */
export interface SortableItemAttributes extends Partial<DragHandleAttributes> {
  className: string
  'data-orientation': ListOrientation
  'data-handle'?: ''
  'data-dragging'?: DragInput
  'data-drop-edge'?: 'before' | 'after'
  'aria-disabled'?: true
}

/** What `SortableItem` passes to the function that renders its element. */
export interface SortableItemRender {
  /** Put on the item's element. */
  ref: (element: HTMLElement | null) => void
  /** Spread onto the same element. Merge your own `className` with `props.className`. */
  props: SortableItemAttributes
  /** Whether this item is being dragged. */
  isDragging: boolean
}

export interface SortableItemProps extends UseSortableOptions {
  /** The list's direction, for where the drop line is drawn. Default `vertical`. */
  orientation?: ListOrientation
  /** Renders the item's element, with `ref` and `props` on it. */
  children: (item: SortableItemRender) => ReactNode
}

/**
 * One item of a sortable list you build from your own elements, with `Sortable`'s look.
 *
 * @remarks
 * `SortableItem` is `useSortable` with what `Sortable` draws around each row: the drop
 * line, the lifted look, and the context a `DragHandle` inside it needs. Use it when the
 * items can't be list items, such as table rows or cards in your own layout. Put `ref` and
 * `props` on the item's element, inside a `Dnd` that applies the move in `onDragEnd`.
 *
 * With `handle`, put a `DragHandle` inside the item; without it, the whole element is the
 * handle and takes focus.
 */
export function SortableItem({
  orientation = 'vertical',
  handle = false,
  disabled = false,
  label,
  children,
  ...options
}: SortableItemProps) {
  const sortable = useSortable({ ...options, label, handle, disabled })
  const { handleRef, handleProps, dragInput, dropEdge } = sortable
  // Without a handle the item itself is the drag control: it takes focus and points to
  // the keyboard instructions, and the keys come from the shared keyboard model.
  const props: SortableItemAttributes = {
    ...(handle ? {} : handleProps),
    className: styles.entry ?? '',
    'data-orientation': orientation,
  }
  if (handle) props['data-handle'] = ''
  if (dragInput) props['data-dragging'] = dragInput
  if (dropEdge) props['data-drop-edge'] = dropEdge
  if (!handle && disabled) props['aria-disabled'] = true
  return (
    <HandleContext.Provider value={{ handleRef, handleProps, label, disabled }}>
      {children({ ref: sortable.ref, props, isDragging: sortable.isDragging })}
    </HandleContext.Provider>
  )
}
