import { cx } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

import { SortableItem } from '#components/SortableItem'
import type { ListOrientation } from '#core/controller'

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
export function ListEntry({ className, children, ...item }: ListEntryProps) {
  return (
    <SortableItem {...item}>
      {({ ref, props }) => (
        <li ref={ref} {...props} className={cx(props.className, className)}>
          {children}
        </li>
      )}
    </SortableItem>
  )
}
