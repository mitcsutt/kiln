/*
 * The engine's interface, in Kiln's own types. Kept apart from ./engine.ts, which imports
 * dnd-kit, so no declaration the public API reaches mentions dnd-kit
 * (src/test/publicTypes.test.ts).
 */

/** Extra options for the engine. Outside semver: they change whenever the engine does. */
export type EngineProps = Record<string, unknown>

/** What the engine reports during a pointer drag. Coordinates are viewport pixels. */
export interface EngineMove {
  /** The id of the dragged item. */
  sourceId: string
  /** The id of the drop target under the pointer, if any. */
  targetId: string | null
  /** Where the pointer is now. */
  pointer: { x: number; y: number }
  /** How far the pointer has moved since the drag started. */
  delta: { x: number; y: number }
}

export interface EngineHandlers {
  start: (sourceId: string) => void
  move: (move: EngineMove) => void
  end: (move: EngineMove, canceled: boolean) => void
}

export interface DraggableInput {
  id: string
  element: Element
  handle: Element | undefined
  disabled: boolean
  /** `clone` lifts the element into the top layer and leaves a copy in place; `none` moves nothing. */
  feedback: 'clone' | 'none'
}

export interface DroppableInput {
  id: string
  element: Element
  disabled: boolean
  /** Higher wins when targets overlap: an item inside a list beats the list. */
  priority: number
  accepts: (sourceId: string) => boolean
}

export interface EngineEntity<T> {
  update: (input: Partial<T>) => void
  destroy: () => void
}

export interface Engine {
  draggable: (input: DraggableInput) => EngineEntity<DraggableInput>
  droppable: (input: DroppableInput) => EngineEntity<DroppableInput>
  destroy: () => void
}
