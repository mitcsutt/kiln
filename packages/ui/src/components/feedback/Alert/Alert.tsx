import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react'
import { CircleCheckIcon, CloseIcon, ErrorIcon, InfoIcon, WarningIcon } from '#icons'
import { cx } from '#utils/cx'
import styles from './Alert.module.css'

export type AlertTone = 'info' | 'positive' | 'caution' | 'critical' | 'neutral'
export type AlertVariant = 'soft' | 'outline'

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Meaning. `critical` and `caution` interrupt (role="alert"); the rest are polite (role="status"). */
  tone?: AlertTone
  /**
   * `outline` (default): a neutral hairline frame on the surface — the tone shows only in
   * the glyph and a short tab on the top edge. `soft`: the louder form, a tinted fill with a
   * tone keyline, for notices that must not be missed.
   */
  variant?: AlertVariant
  /** Short summary, read first. */
  title?: ReactNode
  /** Replaces the tone glyph. Pass `null` to drop it. */
  icon?: ReactNode
  /** A follow-up action, e.g. `<Button size="sm" variant="outline">Retry</Button>`. */
  action?: ReactNode
  /** Shows a dismiss button that calls this. */
  onDismiss?: () => void
  /** Accessible name of the dismiss button. Default "Dismiss". */
  dismissLabel?: string
}

const GLYPH: Record<AlertTone, ReactNode> = {
  info: <InfoIcon />,
  neutral: <InfoIcon />,
  positive: <CircleCheckIcon />,
  caution: <WarningIcon />,
  critical: <ErrorIcon />,
}

/**
 * An inline message about the thing next to it. A hairline frame, the tone in its glyph, never a
 * coloured stripe.
 *
 * @remarks
 * `Alert` tells the reader something about the content around it: an error loading it, a change to
 * it, a success. It's a full hairline frame with the tone in the glyph and a short tab on the top
 * edge, and its title in the heading face. It isn't a tinted box by default, and it never has a
 * coloured stripe down the left edge.
 *
 * @privateRemarks
 * An inline message about the thing next to it. A full hairline frame, the tone in the
 * glyph and a short tab on the top edge, the title in the heading face — never a tinted
 * box by default, never a coloured stripe down the left edge.
 *
 * <Alert tone="critical" title="Couldn't load invoices" action={<Button …>Retry</Button>}>
 *   The billing service didn't answer. We'll try again in 30 seconds.
 * </Alert>
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    tone = 'info',
    variant = 'outline',
    title,
    icon,
    action,
    onDismiss,
    dismissLabel = 'Dismiss',
    role,
    className,
    children,
    ...rest
  },
  ref,
) {
  const titleId = useId()
  const glyph = icon === undefined ? GLYPH[tone] : icon
  return (
    <div
      ref={ref}
      role={role ?? (tone === 'critical' || tone === 'caution' ? 'alert' : 'status')}
      aria-labelledby={title ? titleId : undefined}
      className={cx(styles.alert, className)}
      data-kiln-component=""
      data-tone={tone}
      data-variant={variant}
      data-dismissible={onDismiss ? '' : undefined}
      {...rest}
    >
      {glyph ? (
        <span className={styles.glyph} aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      <div className={styles.body}>
        {title ? (
          <p id={titleId} className={styles.title}>
            {title}
          </p>
        ) : null}
        {children ? <div className={styles.description}>{children}</div> : null}
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className={styles.dismiss}
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  )
})
