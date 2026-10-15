// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- a .d.ts can't be imported, and this one ships the stylesheet declaration
/// <reference path="./stylesheets.d.ts" preserve="true" />
/*
 * @mitcsutt/kiln-dnd public API. Everything a consumer may import lives here: no deep
 * imports, and no type from the drag engine (src/test/publicTypes.test-d.ts).
 */

// Scope
export { Dnd } from './components/Dnd'
export type { DndProps } from './components/Dnd'
export type {
  DndItem,
  DndTarget,
  DragInput,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragCancelEvent,
  ListOrientation,
} from './core/controller'
export { defaultAnnouncements } from './core/messages'
export type { DndAnnouncements, ListPlace, GridPlace, ZonePlace } from './core/messages'
export type { EngineProps } from './core/engineTypes'

// Components
export { Sortable } from './components/Sortable'
export type { SortableProps, SortableMove, SortableItemState } from './components/Sortable'
export { Board } from './components/Board'
export type { BoardProps, BoardColumn, BoardMove, BoardItemState } from './components/Board'
export { Draggable } from './components/Draggable'
export type { DraggableProps } from './components/Draggable'
export { DropZone } from './components/DropZone'
export type { DropZoneProps } from './components/DropZone'
export { GridLayout } from './components/GridLayout'
export type {
  GridLayoutProps,
  GridLayoutItemProps,
  GridBreakpoint,
  GridChange,
} from './components/GridLayout'
export { DragHandle } from './components/DragHandle'
export type { DragHandleProps } from './components/DragHandle'

// Hooks
export { useDraggable } from './hooks/useDraggable'
export type { UseDraggableOptions, UseDraggableResult } from './hooks/useDraggable'
export { useDroppable } from './hooks/useDroppable'
export type { UseDroppableOptions, UseDroppableResult } from './hooks/useDroppable'
export { useSortable } from './hooks/useSortable'
export type { UseSortableOptions, UseSortableResult } from './hooks/useSortable'
export type { DragHandleAttributes } from './core/useDragSource'

// Layouts as data
export { arrayMove, moveBetween } from './data/lists'
export type { ListPosition } from './data/lists'
export { appendItem, removeItem, compact } from './data/layout'
export type { GridItem, GridCompaction, CompactOptions } from './data/layout'
