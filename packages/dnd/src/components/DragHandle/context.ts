import { createContext } from 'react'

import type { DragHandleAttributes } from '#core/useDragSource'

/** What a draggable item hands its `DragHandle`. */
export interface HandleContextValue {
  handleRef: (element: HTMLElement | null) => void
  handleProps: DragHandleAttributes
  /** The item's name, for the handle's accessible name. */
  label: string
  /** The item can't be picked up right now. */
  disabled: boolean
}

export const HandleContext = createContext<HandleContextValue | null>(null)
