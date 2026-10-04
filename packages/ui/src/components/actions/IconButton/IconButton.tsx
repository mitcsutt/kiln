import { forwardRef, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import { Button, type ButtonProps } from '#components/actions/Button'
import styles from './IconButton.module.css'

export type IconButtonShape = 'auto' | 'round' | 'square'

export interface IconButtonProps extends Omit<
  ButtonProps,
  'leadingIcon' | 'trailingIcon' | 'fullWidth' | 'aria-label'
> {
  /**
   * Accessible name — required, because there is no visible text. Say what it does
   * ("Close", "Copy link"), not what it looks like ("X").
   */
  label: string
  /** The glyph. A library icon or any SVG node; it is hidden from assistive tech. */
  icon: ReactNode
  /**
   * `auto` (default) follows the theme's action radius — a circle where actions are
   * pills, a small square in Ledger. `round` forces a circle; `square` uses the field radius.
   */
  shape?: IconButtonShape
  /** Also set the native `title`, so pointer users get the name on hover. Default `false`. */
  showTitle?: boolean
}

/**
 * A square, icon-only Button. Shares Button's variants, tones, sizes, `asChild` and
 * `loading` — it *is* a Button with the padding taken out — so the two always match.
 * Defaults to the quiet `ghost` + `neutral` pairing used in toolbars and headers.
 *
 * <IconButton label="Close" icon={<CloseIcon />} />
 * <IconButton asChild label="GitHub" icon={<ArrowUpRightIcon />}><a href="…" /></IconButton>
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    label,
    icon,
    shape = 'auto',
    showTitle = false,
    variant = 'ghost',
    tone = 'neutral',
    title,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      tone={tone}
      className={cx(styles.iconButton, className)}
      data-shape={shape}
      aria-label={label}
      title={title ?? (showTitle ? label : undefined)}
      leadingIcon={
        <span className={styles.glyph} aria-hidden="true">
          {icon}
        </span>
      }
      {...rest}
    >
      {children}
    </Button>
  )
})
