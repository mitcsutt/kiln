import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import styles from './Kbd.module.css'

export type KbdSize = 'sm' | 'md'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** `sm` for menus and tooltips; `md` (default) inline with body text. */
  size?: KbdSize
}

/**
 * A keyboard key. One key per <Kbd>; write combos as siblings so each key reads
 * separately: <Kbd>⌘</Kbd> <Kbd>K</Kbd>.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <kbd
      ref={ref}
      className={cx(styles.kbd, className)}
      data-kiln-component=""
      data-size={size}
      {...rest}
    />
  )
})
