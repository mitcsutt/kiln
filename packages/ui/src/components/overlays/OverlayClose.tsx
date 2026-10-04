import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { CloseIcon } from '#icons'
import { cx } from '#utils/cx'
import styles from './OverlayClose.module.css'

export interface OverlayCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name. Default "Close". */
  label?: string
}

/** Icon-only close control shared by Dialog and Sheet. Must render inside a Radix Dialog. */
export const OverlayClose = forwardRef<HTMLButtonElement, OverlayCloseProps>(function OverlayClose(
  { label = 'Close', className, ...rest },
  ref,
) {
  return (
    <DialogPrimitive.Close
      ref={ref}
      className={cx(styles.close, className)}
      aria-label={label}
      {...rest}
    >
      <CloseIcon />
    </DialogPrimitive.Close>
  )
})
