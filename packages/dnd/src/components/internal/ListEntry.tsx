import { cx } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

import { HandleContext } from '#components/DragHandle'
import type { ListOrientation } from '#core/controller'
import { useSortable } from '#hooks/useSortable'

import styles from './ListEntry.module.css'

export interface ListEntryProps {
  id: string
  label: string
  index: number
  list: string
  orientation: ListOrientation
  handle: boolean
  disabled: boolean
  className?: string
  children: ReactNode
}

/** One item of a `Sortable` or `Board`: the `li`, its drop line and its lifted look. */
export function ListEntry({
  id,
  label,
  index,
  list,
  orientation,
  handle,
  disabled,
  className,
  children,
}: ListEntryProps) {
  const { ref, handleRef, handleProps, dragInput, dropEdge } = useSortable({
    id,
    label,
    index,
    list,
    handle,
    disabled,
  })
  const own = handle ? {} : handleProps
  return (
    <HandleContext.Provider value={{ handleRef, handleProps, label, disabled }}>
      {/* Without a handle the item itself is the drag control: it takes focus and points
          to the keyboard instructions, and the keys come from the shared keyboard model. */}
      <li
        ref={ref}
        {...own}
        className={cx(styles.entry, className)}
        data-orientation={orientation}
        data-handle={handle ? '' : undefined}
        data-dragging={dragInput ?? undefined}
        data-drop-edge={dropEdge ?? undefined}
        aria-disabled={!handle && disabled ? true : undefined}
      >
        {children}
      </li>
    </HandleContext.Provider>
  )
}
