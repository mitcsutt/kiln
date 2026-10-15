import { useDndController } from '#core/context'
import type { DragInput } from '#core/controller'
import { useDragSource, type DragHandleAttributes } from '#core/useDragSource'

export type { DragHandleAttributes } from '#core/useDragSource'

/** Options for {@link useDraggable}. */
export interface UseDraggableOptions {
  /** Unique within the `Dnd` scope. */
  id: string
  /** The item's name, as announcements and the drag handle say it ("Invoice 1042"). */
  label: string
  /** Anything you want back in `onDragEnd` and `DropZone`'s `onDrop`. */
  data?: unknown
  /** Stops the item being picked up. */
  disabled?: boolean
  /**
   * Drag by a separate handle: put `handleRef` and `handleProps` on it (a `DragHandle`
   * does this for you). Without one, the whole element is the handle. Use a handle
   * whenever the item holds its own links or buttons.
   */
  handle?: boolean
}

/** What {@link useDraggable} returns. */
export interface UseDraggableResult {
  /** Put on the draggable element. */
  ref: (element: HTMLElement | null) => void
  /** Put on the handle, or on the element itself when there is no separate handle. */
  handleRef: (element: HTMLElement | null) => void
  /** Spread onto the same element as `handleRef`: focusability, instructions and the keys. */
  handleProps: DragHandleAttributes
  /** Whether this item is being dragged. */
  isDragging: boolean
  /** How it's being dragged: `keyboard`, `pointer`, or `null`. */
  dragInput: DragInput | null
}

/**
 * Makes an element draggable onto drop zones, by pointer, touch and keyboard.
 *
 * @remarks
 * `useDraggable` is the primitive under `Draggable`. Render it inside a `Dnd` with one or
 * more drop zones (`DropZone` or `useDroppable`): Space or Enter on the handle picks the
 * item up, the arrow keys move it from zone to zone, Space or Enter drops it and Escape
 * cancels. Each step is announced. A pointer drag lifts the element and follows the
 * pointer; touch needs a short press first, so a swipe still scrolls.
 *
 * The drop arrives in `Dnd`'s `onDragEnd` and the zone's `onDrop`, with the `data` you
 * gave the item.
 */
export function useDraggable(options: UseDraggableOptions): UseDraggableResult {
  const controller = useDndController('useDraggable')
  const source = useDragSource(controller, {
    id: options.id,
    label: options.label,
    data: options.data,
    disabled: options.disabled ?? false,
    kind: 'zone',
    instructions: 'list',
    hasHandle: options.handle ?? false,
  })
  return {
    ref: source.ref,
    handleRef: source.handleRef,
    handleProps: source.handleProps,
    isDragging: source.dragging !== null,
    dragInput: source.dragging,
  }
}
