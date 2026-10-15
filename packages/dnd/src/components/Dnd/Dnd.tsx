import { VisuallyHidden } from '@mitcsutt/kiln-ui'
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'

import { DndContext, useIsomorphicLayoutEffect } from '#core/context'
import {
  DndController,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type RootState,
} from '#core/controller'
import { createEngine, loadEngine } from '#core/engine'
import type { EngineProps } from '#core/engineTypes'
import { resolveAnnouncements, type DndAnnouncements } from '#core/messages'
import { useStore } from '#core/store'

export interface DndProps {
  children?: ReactNode
  /**
   * Replace any of the words kiln-dnd says: the handle instructions, the drag handle's
   * name and every announcement. The rest stay English.
   */
  announcements?: Partial<DndAnnouncements>
  /** Called when an item is picked up, by pointer or keyboard. */
  onDragStart?: (event: DragStartEvent) => void
  /** Called whenever the place an item would land changes. */
  onDragOver?: (event: DragOverEvent) => void
  /** Called once when an item is dropped. Apply the move here. */
  onDragEnd?: (event: DragEndEvent) => void
  /** Called when a drag is cancelled (Escape, or the pointer let go over nothing). */
  onDragCancel?: (event: DragCancelEvent) => void
  /**
   * Options passed straight to the drag engine. An escape hatch outside semver: the
   * engine and its options can change in any release. Read when the scope mounts.
   */
  engineProps?: EngineProps
}

/**
 * The scope for draggable items and the places they drop: one keyboard model, one
 * announcer and one drag engine for everything inside it.
 *
 * @remarks
 * `Dnd` wraps the items made with `useDraggable`, `useSortable`, `Draggable` and
 * `DropZone`, and hears every drop in `onDragEnd`. `Sortable`, `Board` and `GridLayout`
 * bring their own, so you only need `Dnd` for drop zones or your own sortable markup.
 *
 * It renders no element of its own, just a live region for announcements and the
 * instructions each drag handle points to. On the server and before hydration, items
 * render as plain markup; the drag engine loads in the browser once the scope mounts, and
 * keyboard dragging works as soon as the page is interactive.
 *
 * ## Keyboard
 *
 * Space or Enter on a handle picks the item up. The arrow keys move it, Space or Enter
 * drops it, and Escape (or leaving the handle) cancels and puts it back. Focus stays on
 * the handle throughout, and returns to it after a drop moves the item.
 */
export function Dnd({
  children,
  announcements,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  engineProps,
}: DndProps) {
  const messages = useMemo(() => resolveAnnouncements(announcements), [announcements])
  const id = useId()
  const [controller] = useState(() => new DndController(messages, id))

  useIsomorphicLayoutEffect(() => {
    controller.setCallbacks({ onDragStart, onDragOver, onDragEnd, onDragCancel })
  })
  useIsomorphicLayoutEffect(() => {
    if (controller.store.get().messages !== messages) controller.store.set({ messages })
  }, [controller, messages])

  // The engine loads on the client only (it touches browser APIs as it loads).
  const [initialEngineProps] = useState(engineProps)
  useEffect(() => {
    let alive = true
    let destroy: (() => void) | undefined
    void loadEngine().then((dndKit) => {
      if (!alive) return
      const engine = createEngine(dndKit, controller.pointer, initialEngineProps)
      destroy = engine.destroy
      controller.store.set({ engine })
    })
    return () => {
      alive = false
      if (controller.operation) controller.cancel()
      destroy?.()
      controller.store.set({ engine: null })
    }
  }, [controller, initialEngineProps])

  useEffect(
    () => () => {
      controller.destroy()
    },
    [controller],
  )

  return (
    <DndContext.Provider value={controller}>
      {children}
      <div hidden id={controller.instructionIds.list}>
        {messages.instructions}
      </div>
      <div hidden id={controller.instructionIds.grid}>
        {messages.gridInstructions}
      </div>
      <Announcer controller={controller} />
    </DndContext.Provider>
  )
}

const selectAnnouncement = (state: RootState) => state.announcement

/**
 * The live region. Every announcement bumps a key, and an odd key adds a no-break space,
 * so saying the same words twice ("moved to position 1 of 5" at the top of a list) is
 * still a change a screen reader reads out.
 */
function Announcer({ controller }: { controller: DndController }) {
  const { text, key } = useStore(controller.store, selectAnnouncement)
  return (
    <VisuallyHidden as="div" aria-live="assertive" aria-atomic="true" data-kiln-dnd-announcer="">
      {text ? `${text}${key % 2 ? ' ' : ''}` : ''}
    </VisuallyHidden>
  )
}
