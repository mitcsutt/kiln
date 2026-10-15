import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'

import { useIsomorphicLayoutEffect } from './context'
import type {
  CustomBehavior,
  DndController,
  DraggableRecord,
  DragInput,
  RootState,
} from './controller'
import type { EngineEntity, DraggableInput, DroppableInput } from './engineTypes'
import { useStore } from './store'

export interface DragSourceOptions {
  id: string
  label: string
  data: unknown
  disabled: boolean
  kind: DraggableRecord['kind']
  list?: string
  index?: number
  custom?: CustomBehavior
  /** Also register the element as a drop target, so a pointer over it reports its id (lists). */
  droppable?: boolean
  /** `none` for grid items, which draw their own drag preview. */
  feedback?: 'clone' | 'none'
  /** Which instructions the handle points to. */
  instructions: 'list' | 'grid'
  /** Whether the item is dragged by a separate handle element. */
  hasHandle: boolean
  /** Whether the handle should be reachable by keyboard (a pointer-only resize grip isn't). */
  keyboard?: boolean
}

/** The props a drag handle (or a whole draggable item) needs. Spread them onto it. */
export interface DragHandleAttributes {
  tabIndex?: number
  'aria-describedby'?: string
  'data-kiln-dnd-handle': ''
  onKeyDown: (event: ReactKeyboardEvent) => void
}

export interface DragSourceState {
  /** Set the item's root element. */
  ref: (element: HTMLElement | null) => void
  /** Set the handle element (the root itself when there is no separate handle). */
  handleRef: (element: HTMLElement | null) => void
  /** Spread onto the handle (or the root when there is no separate handle). */
  handleProps: DragHandleAttributes
  /** How the item is being dragged right now, or `null`. */
  dragging: DragInput | null
}

const selectEngine = (state: RootState) => state.engine

export function useDragSource(
  controller: DndController,
  options: DragSourceOptions,
): DragSourceState {
  const { id, hasHandle, keyboard = true } = options
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [handle, setHandle] = useState<HTMLElement | null>(null)

  // One record per id. It's written after every commit (never during render), so the
  // controller, which reads it from events and effects, always sees the latest label,
  // index and behaviour.
  const recordRef = useRef<DraggableRecord | null>(null)
  const { label, data, disabled, kind, list = '', index = 0, custom = null } = options
  useIsomorphicLayoutEffect(() => {
    if (recordRef.current?.id !== id) recordRef.current = { id } as DraggableRecord
    const record = recordRef.current
    Object.assign(record, {
      label,
      data,
      disabled,
      kind,
      list,
      index,
      custom,
      element,
      handle: hasHandle ? handle : element,
    })
    if (controller.draggables.get(id) !== record) controller.draggables.set(id, record)
  })
  useIsomorphicLayoutEffect(
    () => () => {
      if (controller.draggables.get(id) === recordRef.current) controller.draggables.delete(id)
      // An item that unmounts mid-drag (filtered out, say) ends the drag.
      if (controller.operation?.id === id) controller.cancel()
    },
    [controller, id],
  )

  // The engine, once it has loaded on the client.
  const engine = useStore(controller.store, selectEngine)
  const activator = hasHandle ? handle : element
  const draggableEntity = useRef<EngineEntity<DraggableInput> | null>(null)
  useEffect(() => {
    if (!engine || !element || !activator) return
    const entity = engine.draggable({
      id,
      element,
      handle: hasHandle ? activator : undefined,
      disabled,
      feedback: options.feedback ?? 'clone',
    })
    draggableEntity.current = entity
    return () => {
      draggableEntity.current = null
      entity.destroy()
    }
    // The entity is rebuilt when what it binds to changes; `disabled` updates in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [engine, element, activator, id, hasHandle])
  useEffect(() => {
    draggableEntity.current?.update({ disabled })
  }, [disabled])

  const droppableEntity = useRef<EngineEntity<DroppableInput> | null>(null)
  const isDroppable = options.droppable ?? false
  useEffect(() => {
    if (!engine || !element || !isDroppable) return
    const entity = engine.droppable({
      id,
      element,
      disabled: false,
      priority: 3,
      accepts: (sourceId) => controller.draggables.get(sourceId)?.kind === 'list',
    })
    droppableEntity.current = entity
    return () => {
      droppableEntity.current = null
      entity.destroy()
    }
  }, [engine, element, isDroppable, id, controller])

  // After a keyboard drop the item may have re-rendered somewhere else; give its handle
  // focus back so the next key press still reaches it.
  const wantsFocus = useStore(
    controller.store,
    useCallback((state: RootState) => state.focusId === id, [id]),
  )
  useIsomorphicLayoutEffect(() => {
    if (!wantsFocus) return
    const target = hasHandle ? handle : element
    if (!target) return
    if (target.ownerDocument.activeElement !== target) target.focus()
    controller.store.set({ focusId: null })
  }, [wantsFocus, handle, element, hasHandle, controller])

  const dragging = useStore(
    controller.store,
    useCallback(
      (state: RootState) => (state.operation?.id === id ? state.operation.input : null),
      [id],
    ),
  )

  const ids = controller.instructionIds
  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.defaultPrevented || !keyboard) return
      controller.keyDown(id, event)
    },
    [controller, id, keyboard],
  )

  const handleProps: DragHandleAttributes = {
    'data-kiln-dnd-handle': '',
    onKeyDown,
    ...(keyboard
      ? {
          tabIndex: 0,
          'aria-describedby': options.instructions === 'grid' ? ids.grid : ids.list,
        }
      : {}),
  }

  return {
    ref: setElement,
    handleRef: hasHandle ? setHandle : setElement,
    handleProps,
    dragging,
  }
}
