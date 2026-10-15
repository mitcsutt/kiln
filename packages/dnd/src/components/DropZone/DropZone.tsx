import { cx } from '@mitcsutt/kiln-ui'
import { forwardRef, useCallback, type HTMLAttributes } from 'react'

import type { DndItem } from '#core/controller'
import { useDroppable } from '#hooks/useDroppable'

import styles from './DropZone.module.css'

export interface DropZoneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'onDrop'> {
  /** Unique within the `Dnd` scope. */
  id: string
  /** The zone's name, as announcements say it ("Archive"). */
  label: string
  /** Which items it takes. Default: every item in the scope. */
  accept?: (item: DndItem) => boolean
  /** Anything you want back in `onDragEnd`'s target. */
  data?: unknown
  /** Stops it taking drops. */
  disabled?: boolean
  /** Called when an item is dropped here, with the item's `id`, `label` and `data`. */
  onDrop?: (item: DndItem) => void
}

/**
 * A place to drop `Draggable` items.
 *
 * @remarks
 * A `DropZone` is a framed area. While an item it accepts is being dragged, its frame
 * darkens; when the item would land in it, it fills with the accent's soft tint. Its
 * `label` is what a keyboard user hears as the arrow keys bring an item over it ("Invoice
 * 1042 is over Archive"), so name it after the destination.
 *
 * `onDrop` gets the dropped item. Put the zone's own content (a heading, the items it
 * already holds) inside it.
 */
export const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(function DropZone(
  { id, label, accept, data, disabled = false, onDrop, className, children, ...rest },
  forwardedRef,
) {
  const droppable = useDroppable({ id, label, accept, data, disabled, onDrop })
  const { ref: droppableRef } = droppable
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      droppableRef(node)
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [droppableRef, forwardedRef],
  )
  return (
    <div
      ref={ref}
      {...rest}
      className={cx(styles.zone, className)}
      data-active={droppable.isActive ? '' : undefined}
      data-over={droppable.isOver ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      {children}
    </div>
  )
})
