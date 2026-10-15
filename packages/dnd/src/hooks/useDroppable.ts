import { useCallback, useEffect, useRef, useState } from 'react'

import { useDndController, useIsomorphicLayoutEffect } from '#core/context'
import type { DndItem, DroppableRecord, ListOrientation, RootState } from '#core/controller'
import type { DroppableInput, EngineEntity } from '#core/engineTypes'
import { useStore } from '#core/store'

/** Options for {@link useDroppable}. */
export interface UseDroppableOptions {
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
  /** Called when an item is dropped here. */
  onDrop?: (item: DndItem) => void
  /**
   * Makes this the container of a sortable list (the `list` its `useSortable` items
   * name) instead of a drop zone: an item dropped on it, or moved into it by keyboard
   * while it's empty, joins the list.
   */
  list?: string
  /** For a list container: the list's direction. Default `vertical`. */
  orientation?: ListOrientation
}

/** What {@link useDroppable} returns. */
export interface UseDroppableResult {
  /** Put on the drop target. */
  ref: (element: HTMLElement | null) => void
  /** Whether the dragged item would land here if dropped now. */
  isOver: boolean
  /** Whether an item this target accepts is being dragged. */
  isActive: boolean
}

/**
 * Makes an element a place to drop draggable items.
 *
 * @remarks
 * `useDroppable` is the primitive under `DropZone`. While an item it accepts is dragged,
 * `isActive` is true; `isOver` is true when the item would land here. A keyboard user
 * reaches drop zones with the arrow keys, in document order, and hears each zone's
 * `label`.
 */
export function useDroppable(options: UseDroppableOptions): UseDroppableResult {
  const controller = useDndController('useDroppable')
  const { id } = options
  const [element, setElement] = useState<HTMLElement | null>(null)

  // Written after every commit, never during render (see useDragSource).
  const recordRef = useRef<DroppableRecord | null>(null)
  const { label, data, accept, list, onDrop } = options
  const disabled = options.disabled ?? false
  const orientation = options.orientation ?? 'vertical'
  useIsomorphicLayoutEffect(() => {
    if (recordRef.current?.id !== id) recordRef.current = { id } as DroppableRecord
    const record = recordRef.current
    Object.assign(record, { label, data, disabled, accept, list, orientation, element, onDrop })
    if (controller.droppables.get(id) !== record) controller.droppables.set(id, record)
  })
  useIsomorphicLayoutEffect(
    () => () => {
      if (controller.droppables.get(id) === recordRef.current) controller.droppables.delete(id)
    },
    [controller, id],
  )

  const engine = useStore(controller.store, selectEngine)
  const entity = useRef<EngineEntity<DroppableInput> | null>(null)
  const isList = options.list !== undefined
  useEffect(() => {
    if (!engine || !element) return
    const created = engine.droppable({
      id,
      element,
      disabled,
      // An item inside a list beats the list; a zone sits between them.
      priority: isList ? 1 : 2,
      accepts: (sourceId) => controller.accepts(id, sourceId),
    })
    entity.current = created
    return () => {
      entity.current = null
      created.destroy()
    }
    // `disabled` updates in place below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [engine, element, id, isList, controller])
  useEffect(() => {
    entity.current?.update({ disabled })
  }, [disabled])

  const isOver = useStore(
    controller.store,
    useCallback((state: RootState) => controller.isOver(state, id), [controller, id]),
  )
  const isActive = useStore(
    controller.store,
    useCallback(
      (state: RootState) => state.operation !== null && controller.accepts(id, state.operation.id),
      [controller, id],
    ),
  )
  return { ref: setElement, isOver, isActive }
}

const selectEngine = (state: RootState) => state.engine
