import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'
import { Spinner } from '#components/feedback/Spinner'
import styles from './Button.module.css'

export type ButtonVariant = 'solid' | 'outline' | 'ghost'
export type ButtonTone = 'accent' | 'neutral' | 'critical'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VisibilityProps {
  /** Visual weight. One `solid` per view is the norm — it *is* the primary action. */
  variant?: ButtonVariant
  /** Colour intent. `critical` is for destructive actions only. */
  tone?: ButtonTone
  size?: Size
  /** Icon before the label. Pass a library icon or any SVG node. */
  leadingIcon?: ReactNode
  /** Icon after the label. Not a decorative "→" — only when it adds meaning (e.g. external). */
  trailingIcon?: ReactNode
  /** Shows a spinner, sets `aria-busy` and disables interaction while keeping the width. */
  loading?: boolean
  /** Stretch to the container's width. */
  fullWidth?: boolean
  /**
   * Render the single child element instead of a <button>, merging props and styles.
   * Use for links: `<Button asChild><Link to="/work">Work</Link></Button>`.
   */
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    tone = 'accent',
    size = 'md',
    leadingIcon,
    trailingIcon,
    loading = false,
    fullWidth = false,
    asChild = false,
    disabled,
    hideBelow,
    hideAbove,
    className,
    children,
    type,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      ref={ref}
      className={cx(styles.button, visibilityClass({ hideBelow, hideAbove }), className)}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : Boolean(disabled) || loading}
      aria-disabled={asChild && (disabled || loading) ? true : undefined}
      type={asChild ? undefined : (type ?? 'button')}
      {...rest}
    >
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      <Slot.Slottable>{children}</Slot.Slottable>
      {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
      {loading ? (
        <span className={styles.spinner}>
          <Spinner label={null} />
        </span>
      ) : null}
    </Comp>
  )
})
