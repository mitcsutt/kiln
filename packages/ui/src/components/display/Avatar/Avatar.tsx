import { forwardRef, useContext, type HTMLAttributes } from 'react'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cx } from '#utils/cx'
import { AvatarSizeContext } from './AvatarContext'
import { avatarColor, getInitials } from './avatarUtils'
import type { AvatarColor, AvatarSize } from './avatarUtils'
import styles from './Avatar.module.css'

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Image URL. While loading, or if it fails, the initials fallback shows. */
  src?: string
  /** Accessible name. Defaults to `name`. Pass `""` when a visible label sits beside it. */
  alt?: string
  /** Person or thing. Drives the initials and the fallback colour. */
  name: string
  /** Default `md`, or the enclosing `AvatarGroup`'s size. */
  size?: AvatarSize
  /** Override the name-derived fallback colour (e.g. a member's assigned colour). */
  color?: AvatarColor
  /** A highlight ring — marks "you" in a leaderboard or roster. */
  ring?: boolean
  /**
   * Replace the derived initials — a team code ("GER"), a club crest's letters. Up to three
   * characters; three are set smaller so they fit the frame.
   */
  initials?: string
}

/**
 * A person or entity. Image with an initials fallback on a deterministic categorical
 * colour. Shape comes from `--radius-avatar` (rounded square in Monograph/Ledger, round in
 * Fiesta).
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, name, size, color, ring = false, initials, className, ...rest },
  ref,
) {
  const groupSize = useContext(AvatarSizeContext)
  const label = alt ?? name
  const decorative = label === ''
  const text = initials?.trim() ? initials.trim().toLocaleUpperCase() : getInitials(name)
  const glyphs = Array.from(text).length
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cx(styles.avatar, className)}
      data-size={size ?? groupSize ?? 'md'}
      data-color={color ?? avatarColor(name)}
      data-ring={ring || undefined}
      {...rest}
    >
      {src ? <AvatarPrimitive.Image className={styles.image} src={src} alt={label} /> : null}
      <AvatarPrimitive.Fallback
        className={styles.fallback}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
        delayMs={src ? 300 : undefined}
        data-glyphs={glyphs > 2 ? 'many' : undefined}
      >
        <span aria-hidden="true">{text}</span>
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
})
