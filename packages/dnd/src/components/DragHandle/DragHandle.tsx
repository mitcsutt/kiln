import { createIcon, cx, IconButton, type IconButtonProps } from '@mitcsutt/kiln-ui'
import { forwardRef, useCallback, useContext, type KeyboardEvent } from 'react'

import { useDndController } from '#core/context'
import type { RootState } from '#core/controller'
import { useStore } from '#core/store'

import { HandleContext } from './context'
import styles from './DragHandle.module.css'

/** Six dots: the grip people already know as "drag here". */
const GripIcon = createIcon(
  'GripIcon',
  <path d="M7.5 5.5h.01M12.5 5.5h.01M7.5 10h.01M12.5 10h.01M7.5 14.5h.01M12.5 14.5h.01" />,
)

export interface DragHandleProps extends Omit<IconButtonProps, 'label' | 'icon'> {
  /** The accessible name. Default "Move" and the item's label, from `announcements.handle`. */
  label?: string
}

const selectMessages = (state: RootState) => state.messages

/**
 * The grip a draggable item is picked up by.
 *
 * @remarks
 * Put `DragHandle` inside a `Sortable` or `Board` item rendered with `handle`, inside a
 * `GridLayout.Item` (which always drags by a handle) or inside a `Draggable` with
 * `handle`. It's a small `IconButton` named after the item ("Move Revenue") that points
 * to the scope's keyboard instructions, so a screen reader says how to use it.
 *
 * Use a handle whenever the item holds its own links, buttons or fields: clicks and keys
 * inside the item then stay theirs, and only the handle starts a drag.
 */
export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(function DragHandle(
  { label, className, onKeyDown, size = 'sm', ...rest },
  forwardedRef,
) {
  const item = useContext(HandleContext)
  if (!item) {
    throw new Error(
      'DragHandle must be rendered inside a draggable item: a Sortable or Board item with `handle`, a GridLayout.Item, or a Draggable with `handle`.',
    )
  }
  const controller = useDndController('DragHandle')
  const messages = useStore(controller.store, selectMessages)
  const { handleRef, handleProps, disabled } = item
  const ref = useCallback(
    (node: HTMLButtonElement | null) => {
      handleRef(node)
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [handleRef, forwardedRef],
  )
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    handleProps.onKeyDown(event)
  }
  return (
    <IconButton
      ref={ref}
      {...rest}
      {...handleProps}
      size={size}
      label={label ?? messages.handle(item.label)}
      icon={<GripIcon />}
      className={cx(styles.handle, className)}
      aria-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
    />
  )
})
