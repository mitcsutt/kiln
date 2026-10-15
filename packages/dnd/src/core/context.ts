import { createContext, useContext, useEffect, useLayoutEffect } from 'react'

import type { DndController } from './controller'

export const DndContext = createContext<DndController | null>(null)

/** The nearest `Dnd` scope's controller. Throws outside one, naming the hook that needs it. */
export function useDndController(caller: string): DndController {
  const controller = useContext(DndContext)
  if (!controller) {
    throw new Error(
      `${caller} must be rendered inside <Dnd>. Wrap the draggable items and their drop targets in one <Dnd>.`,
    )
  }
  return controller
}

export const useIsomorphicLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect
