import { Children, forwardRef, isValidElement, type HTMLAttributes, type MouseEvent } from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import { CloseIcon } from '#icons'
import styles from './Tag.module.css'

/** Categorical colour slot → `--color-cat-N`. */
export type TagColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type TagSize = 'sm' | 'md'

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** A categorical colour (category, person, topic). Omit for a neutral tag. */
  color?: TagColor
  /** `md` (default), or `sm` for dense lists of many tags. */
  size?: TagSize
  /** Renders a remove button after the label. Not rendered when `asChild`. */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void
  /** Accessible name for the remove button. Default `Remove <label>` for text labels. */
  removeLabel?: string
  /** Render the single child (e.g. a filter link) as the tag. Incompatible with `onRemove`. */
  asChild?: boolean
}

/**
 * Quiet metadata, like a category, a facility or a group, in a wrapping list that can be edited.
 *
 * @remarks
 * A `Tag` labels a thing with metadata, and a `TagList` lays several out as a real list that
 * wraps. Tags are quieter than {@link Badge | badges}, which are for status.
 *
 * @privateRemarks
 * Quiet metadata: a category, a stack item, a group. Quieter than `Badge`, which is
 * for status. Group several in a `TagList`.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { color, size = 'md', onRemove, removeLabel, asChild = false, className, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot.Root : 'span'
  const canRemove = Boolean(onRemove) && !asChild
  const label = removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')
  return (
    <Comp
      ref={ref}
      className={cx(styles.tag, className)}
      data-color={color}
      data-size={size}
      data-removable={canRemove || undefined}
      {...rest}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      {canRemove ? (
        <button type="button" className={styles.remove} aria-label={label} onClick={onRemove}>
          <CloseIcon />
        </button>
      ) : null}
    </Comp>
  )
})

export type TagListProps = HTMLAttributes<HTMLUListElement>

/** A wrapping list of tags. Each child is wrapped in an `<li>`. */
export const TagList = forwardRef<HTMLUListElement, TagListProps>(function TagList(
  { className, children, ...rest },
  ref,
) {
  return (
    <ul ref={ref} role="list" className={cx(styles.list, className)} {...rest}>
      {Children.map(children, (child) =>
        isValidElement(child) || typeof child === 'string' || typeof child === 'number' ? (
          <li key={isValidElement(child) ? child.key : undefined}>{child}</li>
        ) : null,
      )}
    </ul>
  )
})
