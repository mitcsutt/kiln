import { cx } from '@mitcsutt/kiln-ui'
import { forwardRef, useCallback, type HTMLAttributes, type KeyboardEvent } from 'react'

import { HandleContext } from '#components/DragHandle'
import { useDraggable } from '#hooks/useDraggable'

import styles from './Draggable.module.css'

export interface DraggableProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  /** Unique within the `Dnd` scope. */
  id: string
  /** The item's name, as announcements and its handle say it ("Invoice 1042"). */
  label: string
  /** Anything you want back in `onDragEnd` and `DropZone`'s `onDrop`. */
  data?: unknown
  /** Stops the item being picked up. */
  disabled?: boolean
  /**
   * Drag by a `DragHandle` inside it instead of by the whole item. Use one whenever the
   * item holds links, buttons or fields of its own.
   */
  handle?: boolean
}

/**
 * Something you can pick up and drop onto a `DropZone`.
 *
 * @remarks
 * `Draggable` and `DropZone` go inside one `Dnd`. Without `handle`, the whole item is
 * the handle: it takes focus, and Space or Enter picks it up. The arrow keys then move it
 * from zone to zone, in the order they appear on the page, and Space or Enter drops it.
 *
 * A pointer drag lifts the item and leaves a faded copy where it was; touch needs a short
 * press first, so a swipe still scrolls the page. `Draggable` adds no chrome of its own:
 * put a `Card` or any other content inside.
 */
export const Draggable = forwardRef<HTMLDivElement, DraggableProps>(function Draggable(
  { id, label, data, disabled = false, handle = false, className, onKeyDown, children, ...rest },
  forwardedRef,
) {
  const draggable = useDraggable({ id, label, data, disabled, handle })
  const { ref: draggableRef, handleRef } = draggable
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      draggableRef(node)
      if (!handle) handleRef(node)
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [draggableRef, handleRef, handle, forwardedRef],
  )
  const ownHandle = handle ? {} : draggable.handleProps
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (!handle) draggable.handleProps.onKeyDown(event)
  }
  return (
    <HandleContext.Provider
      value={{ handleRef, handleProps: draggable.handleProps, label, disabled }}
    >
      {/* Without a handle the item itself is the control: it takes focus, and its keys and
          instructions come from the shared keyboard model. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- see above */}
      <div
        ref={ref}
        {...rest}
        {...ownHandle}
        className={cx(styles.draggable, className)}
        data-handle={handle ? '' : undefined}
        data-dragging={draggable.dragInput ?? undefined}
        aria-disabled={!handle && disabled ? true : undefined}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </HandleContext.Provider>
  )
})
