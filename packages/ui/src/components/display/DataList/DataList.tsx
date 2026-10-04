import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import styles from './DataList.module.css'

export type DataListOrientation = 'horizontal' | 'vertical'

export interface DataListProps extends HTMLAttributes<HTMLDListElement> {
  /**
   * `horizontal` (default): labels in a hang column, values aligned beside them.
   * `vertical`: each label sits above its value — for narrow columns and inline meta strips.
   */
  orientation?: DataListOrientation
  /** Hairline rules between items. */
  divided?: boolean
}

/**
 * Label/value pairs as a real `<dl>`: a project's facts, a match's venue and kick-off,
 * an account's details.
 *
 * <DataList><DataList.Item label="Venue">Harbour Park</DataList.Item></DataList>
 */
const DataListRoot = forwardRef<HTMLDListElement, DataListProps>(function DataList(
  { orientation = 'horizontal', divided = false, className, ...rest },
  ref,
) {
  return (
    <dl
      ref={ref}
      className={cx(styles.list, className)}
      data-orientation={orientation}
      data-divided={divided || undefined}
      {...rest}
    />
  )
})

export interface DataListItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode
  /** The value. Numbers are tabular. */
  children?: ReactNode
}

const DataListItem = forwardRef<HTMLDivElement, DataListItemProps>(function DataListItem(
  { label, children, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx(styles.item, className)} {...rest}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  )
})

export const DataList = Object.assign(DataListRoot, { Item: DataListItem })
