import type { ReactNode } from 'react'
import { InfoIcon, WarningIcon } from '#icons'
import { Spinner } from '#components/feedback/Spinner'
import { cx } from '#utils/cx'
import styles from './messages.module.css'

export interface LabelContentProps {
  children: ReactNode
  required?: boolean
  /** `true` shows "Optional"; a string replaces the word (for other languages). */
  optional?: boolean | string
  /** Shows a small spinner after the label — the field is `validating`. */
  busy?: boolean
}

/** The inside of a label: text, required mark, optional hint, validating spinner. */
export function LabelContent({ children, required, optional, busy }: LabelContentProps) {
  return (
    <>
      {children}
      {required ? (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      ) : optional ? (
        <span className={styles.optional}>{optional === true ? 'Optional' : optional}</span>
      ) : null}
      {busy ? <Spinner size="sm" label={null} className={styles.busy} /> : null}
    </>
  )
}

export function FieldDescription({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: ReactNode
}) {
  return (
    <div id={id} className={cx(styles.description, className)}>
      {children}
    </div>
  )
}

/** Non-blocking advice. Never `role="alert"` — it doesn't interrupt like an error does. */
export function FieldWarning({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: ReactNode
}) {
  return (
    <div id={id} className={cx(styles.warning, className)}>
      <InfoIcon className={styles.warningIcon} />
      <span>{children}</span>
    </div>
  )
}

/**
 * Error text. `live` (default `true`) gives it `role="alert"` so a message that appears
 * after blur is announced; pass `false` once the form's `ErrorSummary` owns the
 * announcement (it's still reachable via `aria-describedby` either way).
 */
export function FieldError({
  id,
  className,
  live = true,
  children,
}: {
  id: string
  className?: string
  live?: boolean
  children: ReactNode
}) {
  return (
    <div id={id} className={cx(styles.error, className)} role={live ? 'alert' : undefined}>
      <WarningIcon className={styles.errorIcon} />
      <span>{children}</span>
    </div>
  )
}

/** A `maxLength` character counter ("12 / 280"). Politely announced only near the limit. */
export function FieldCount({
  id,
  className,
  live,
  children,
}: {
  id: string
  className?: string
  live?: boolean
  children: ReactNode
}) {
  return (
    <div id={id} className={cx(styles.count, className)} aria-live={live ? 'polite' : undefined}>
      {children}
    </div>
  )
}
