import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Toggle } from 'radix-ui'
import { cx } from '#utils/cx'
import styles from './chip.module.css'

export type ToggleChipSize = 'sm' | 'md'

export interface ToggleChipProps extends ComponentPropsWithoutRef<typeof Toggle.Root> {
  size?: ToggleChipSize
  /** A leading glyph. Keep it meaningful — one icon per row at most. */
  icon?: ReactNode
  /** How many items the filter matches. Rendered in tabular figures after the label. */
  count?: number
}

/**
 * A pressable filter chip — an on/off switch that reads as a word ("Mine", "Scorers
 * only"). Built on Radix Toggle, so it is a real `<button aria-pressed>`; use
 * `pressed`/`onPressedChange` (controlled) or `defaultPressed`.
 *
 * Pressed chips take the accent's soft fill. Where the theme has a hard press shadow
 * (Fiesta), resting chips stand proud and pressed chips sit flat — literally pushed in.
 */
export const ToggleChip = forwardRef<HTMLButtonElement, ToggleChipProps>(function ToggleChip(
  { size = 'md', icon, count, className, children, type, ...rest },
  ref,
) {
  return (
    <Toggle.Root
      ref={ref}
      type={type ?? 'button'}
      className={cx(styles.chip, className)}
      data-size={size}
      {...rest}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {count !== undefined ? <span className={styles.count}>{count}</span> : null}
    </Toggle.Root>
  )
})
