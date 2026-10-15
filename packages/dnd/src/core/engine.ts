/*
 * The drag engine, `@dnd-kit/dom`, behind a small interface. This is the only module that
 * imports dnd-kit, and it does so with a dynamic `import()` that runs on the client after
 * mount: dnd-kit touches `ResizeObserver` when it loads, so a server import would crash,
 * and an app pays for the engine only once a drag surface renders. No dnd-kit type leaves
 * this file (src/test/publicTypes.test-d.ts).
 *
 * Kiln owns everything but the pointer: the keyboard model, announcements, drop targets in
 * data space (an index, a cell, a zone) and the visuals. The engine reports where a
 * pointer drag is and what it's over; Kiln decides what that means.
 */
import type * as DndKit from '@dnd-kit/dom'

import type { Engine, EngineHandlers, EngineMove, EngineProps } from './engineTypes'

let engineModule: Promise<typeof DndKit> | undefined

/** Loads the engine once per page. Call it only in the browser. */
export function loadEngine(): Promise<typeof DndKit> {
  engineModule ??= import('@dnd-kit/dom')
  return engineModule
}

/**
 * Pointer activation: mouse and pen start as soon as the pointer moves 5px, so a click on
 * an item stays a click; touch needs a 250ms press (5px of wobble allowed), so a swipe
 * still scrolls the page.
 */
export const TOUCH_DELAY = 250
export const POINTER_DISTANCE = 5

export function createEngine(
  dndKit: typeof DndKit,
  handlers: EngineHandlers,
  engineProps?: EngineProps,
): Engine {
  const { DragDropManager, PointerSensor, PointerActivationConstraints, Feedback } = dndKit
  const manager = new DragDropManager({
    sensors: [
      PointerSensor.configure({
        activationConstraints: (event) =>
          event.pointerType === 'touch'
            ? [new PointerActivationConstraints.Delay({ value: TOUCH_DELAY, tolerance: 5 })]
            : [new PointerActivationConstraints.Distance({ value: POINTER_DISTANCE })],
      }),
    ],
    // No `Accessibility` plugin (Kiln announces) and no `KeyboardSensor` (Kiln's keyboard
    // model moves in data space). No drop animation: the list commits on drop and renders
    // the item in its new place, so animating back to the old slot would be wrong.
    plugins: [
      dndKit.AutoScroller,
      dndKit.Cursor,
      dndKit.PreventSelection,
      Feedback.configure({ dropAnimation: null }),
    ],
    ...engineProps,
  })

  const snapshot = (): EngineMove => {
    const operation = manager.dragOperation
    const { current, initial } = operation.position
    return {
      sourceId: String(operation.source?.id ?? ''),
      targetId: operation.target ? String(operation.target.id) : null,
      pointer: { x: current.x, y: current.y },
      delta: { x: current.x - initial.x, y: current.y - initial.y },
    }
  }

  const off = [
    manager.monitor.addEventListener('dragstart', (event) => {
      handlers.start(String(event.operation.source?.id ?? ''))
    }),
    manager.monitor.addEventListener('dragmove', (event) => {
      const move = snapshot()
      // `dragmove` fires before the operation's position updates, so read the
      // destination from the event (dnd-kit 0.5).
      if (event.to) {
        const { initial } = manager.dragOperation.position
        move.pointer = { x: event.to.x, y: event.to.y }
        move.delta = { x: event.to.x - initial.x, y: event.to.y - initial.y }
      }
      handlers.move(move)
    }),
    manager.monitor.addEventListener('dragover', () => {
      handlers.move(snapshot())
    }),
    manager.monitor.addEventListener('dragend', (event) => {
      handlers.end(snapshot(), event.canceled)
    }),
  ]

  return {
    draggable(input) {
      const entity = new dndKit.Draggable(
        {
          id: input.id,
          element: input.element,
          handle: input.handle,
          disabled: input.disabled,
          plugins: [Feedback.configure({ feedback: input.feedback })],
        },
        manager,
      )
      return {
        update(next) {
          if (next.element !== undefined) entity.element = next.element
          if ('handle' in next) entity.handle = next.handle
          if (next.disabled !== undefined) entity.disabled = next.disabled
        },
        destroy: () => {
          entity.destroy()
        },
      }
    },
    droppable(input) {
      let accepts = input.accepts
      const entity = new dndKit.Droppable(
        {
          id: input.id,
          element: input.element,
          disabled: input.disabled,
          collisionPriority: input.priority,
          accept: (source) => accepts(String(source.id)),
        },
        manager,
      )
      return {
        update(next) {
          if (next.element !== undefined) entity.element = next.element
          if (next.disabled !== undefined) entity.disabled = next.disabled
          if (next.accepts) accepts = next.accepts
        },
        destroy: () => {
          entity.destroy()
        },
      }
    },
    destroy() {
      for (const remove of off) remove()
      manager.destroy()
    },
  }
}
