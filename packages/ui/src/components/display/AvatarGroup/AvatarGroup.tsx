import { Children, forwardRef, isValidElement, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { AvatarSizeContext, type AvatarSize } from '#components/display/Avatar'
import styles from './AvatarGroup.module.css'

export interface AvatarGroupProps extends HTMLAttributes<HTMLElement> {
  /** Show at most this many avatars; the rest collapse into a "+N" count. */
  max?: number
  /** Size for every avatar in the stack. Default `sm`. */
  size?: AvatarSize
  /** Accessible name for the group, e.g. "Reacted: Noor, Kofi and 3 others". */
  'aria-label'?: string
}

/**
 * An overlapping row of avatars, like who's on a crew or who reacted, with a count for the rest.
 *
 * @remarks
 * `AvatarGroup` overlaps its `Avatar` children and, past `max`, replaces the rest with a count.
 * Give it an `aria-label` that names the group.
 *
 * @privateRemarks
 * An overlapping stack of `Avatar`s — who reacted, who owns a project, who's in a group.
 *
 * <AvatarGroup max={4} aria-label="Members"><Avatar name="Noor" />…</AvatarGroup>
 */
export const AvatarGroup = forwardRef<HTMLElement, AvatarGroupProps>(function AvatarGroup(
  { max, size = 'sm', className, children, ...rest },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement)
  const limit = max !== undefined && max >= 0 && items.length > max ? max : items.length
  const overflow = items.length - limit
  return (
    <AvatarSizeContext.Provider value={size}>
      {/* A span, like Avatar, so a group can sit inside a button or a line of text. */}
      <span
        ref={ref}
        role="group"
        className={cx(styles.group, className)}
        data-size={size}
        {...rest}
      >
        {items.slice(0, limit)}
        {overflow > 0 ? (
          <span
            className={styles.more}
            data-size={size}
            role="img"
            aria-label={`${String(overflow)} more`}
          >
            <span aria-hidden="true">+{overflow}</span>
          </span>
        ) : null}
      </span>
    </AvatarSizeContext.Provider>
  )
})
