import { useDndController } from '#core/context'
import type { DragInput } from '#core/controller'
import { useDragSource, type DragHandleAttributes } from '#core/useDragSource'
import { useCallback } from 'react'

import { useStore } from '#core/store'

/** Options for {@link useSortable}. */
export interface UseSortableOptions {
  /** Unique within the `Dnd` scope. */
  id: string
  /** The item's name, as announcements and the drag handle say it. */
  label: string
  /** Its index in its list, from 0. */
  index: number
  /** The list it belongs to. Items move between lists in the same `Dnd`. Default `list`. */
  list?: string
  /** Anything you want back in `onDragEnd`. */
  data?: unknown
  /** Stops the item being picked up. It can still move as others move around it. */
  disabled?: boolean
  /** Drag by a separate handle (see `useDraggable`). */
  handle?: boolean
}

/** What {@link useSortable} returns. */
export interface UseSortableResult {
  /** Put on the item. */
  ref: (element: HTMLElement | null) => void
  /** Put on the handle, or on the item when there is no separate handle. */
  handleRef: (element: HTMLElement | null) => void
  /** Spread onto the same element as `handleRef`. */
  handleProps: DragHandleAttributes
  /** Whether this item is being dragged. */
  isDragging: boolean
  /** How it's being dragged: `keyboard`, `pointer`, or `null`. */
  dragInput: DragInput | null
  /** Where to draw the drop line around this item, if the drag would land next to it. */
  dropEdge: 'before' | 'after' | null
}

/**
 * Makes an element one item of a reorderable list.
 *
 * @remarks
 * `useSortable` is the primitive under `Sortable` and `Board`. Give each item its `index`
 * and, for several lists, its `list`; nothing moves while the item is dragged. Instead
 * `dropEdge` tells each item whether the drop line belongs before or after it, and the
 * drop arrives once, in `Dnd`'s `onDragEnd`, as a target `{ kind: 'list', list, index }`
 * you can hand to `arrayMove` or `moveBetween`.
 *
 * By keyboard, the arrow keys along the list move the item through it and the arrow keys
 * across it move it to the neighbouring list. A list is vertical unless its container says
 * otherwise: `useDroppable({ list, orientation: 'horizontal' })`. That container is also
 * what an item drops into when the list is empty.
 *
 * Drop zones in the same `Dnd` that accept the item come after the last list: the arrow
 * across it (Right, or Down for a horizontal list) steps onto the first zone, the arrows
 * then step through the zones in document order, and stepping back past the first zone
 * returns to the last list. A drop there arrives as a `{ kind: 'zone' }` target and calls
 * the zone's `onDrop`, just as a pointer drop on the zone does.
 */
export function useSortable(options: UseSortableOptions): UseSortableResult {
  const controller = useDndController('useSortable')
  const { id } = options
  const source = useDragSource(controller, {
    id,
    label: options.label,
    data: options.data,
    disabled: options.disabled ?? false,
    kind: 'list',
    list: options.list ?? 'list',
    index: options.index,
    droppable: true,
    instructions: 'list',
    hasHandle: options.handle ?? false,
  })
  const dropEdge = useStore(
    controller.store,
    useCallback((state) => controller.dropEdge(state, id), [controller, id]),
  )
  return {
    ref: source.ref,
    handleRef: source.handleRef,
    handleProps: source.handleProps,
    isDragging: source.dragging !== null,
    dragInput: source.dragging,
    dropEdge,
  }
}
