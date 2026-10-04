/*
 * Story-only helpers for the overlay stories. Not exported from the package.
 *
 * `Stage` gives an open overlay a box to live in: it's a containing block for
 * `position: fixed` (via `transform`), and the overlay is portalled into it with the
 * `container` prop, so each column of the "All themes" matrix shows its own dialog
 * instead of three stacking in the middle of the page.
 */
import { useState, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import styles from './StoryKit.module.css'

export function Stage({
  children,
  size = 'md',
}: {
  children: (container: HTMLElement) => ReactNode
  size?: 'md' | 'lg'
}) {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  return (
    <div ref={setEl} className={styles.stage} data-size={size}>
      {el ? children(el) : null}
    </div>
  )
}

/** Label/value line with tabular figures on the right. */
export function Row({
  label,
  value,
  strong,
}: {
  label: ReactNode
  value: ReactNode
  strong?: boolean
}) {
  return (
    <div className={styles.row} data-strong={strong ? true : undefined}>
      <span>{label}</span>
      <span className={styles.figure}>{value}</span>
    </div>
  )
}

export function Muted({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx(styles.muted, className)} {...rest} />
}

export function Body({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx(styles.body, className)} {...rest} />
}

export function Strong({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx(styles.strong, className)} {...rest} />
}

/** Empty room below (or above) a trigger so an open overlay fits in the story frame. */
export function Spacer({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <div className={styles.spacer} data-size={size} aria-hidden />
}

/** A card-like box that clips its content — to prove tooltips escape it. */
export function Clip({ children }: { children: ReactNode }) {
  return <div className={styles.clip}>{children}</div>
}
