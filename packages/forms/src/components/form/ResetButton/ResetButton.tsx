import { forwardRef, type MouseEvent } from 'react'
import { Button, type ButtonProps } from '@mitcsutt/kiln-ui'
import { resetForm } from '#runtime/baseline'
import { getFormRuntime, useResolvedForm, type AnyKitForm } from '#runtime/formRuntime'

export interface ResetButtonProps extends Omit<ButtonProps, 'type' | 'form'> {
  /** Defaults to the form in context. */
  form?: AnyKitForm
  /** `baseline` (default): undo edits since the last save. `defaults`: back to the original defaults. */
  to?: 'defaults' | 'baseline'
}

/** Resets the form. Quiet by default (`ghost`, `neutral`). Default text: `messages.reset`. */
export const ResetButton = forwardRef<HTMLButtonElement, ResetButtonProps>(function ResetButton(
  { form, to = 'baseline', variant = 'ghost', tone = 'neutral', onClick, children, ...rest },
  ref,
) {
  const resolved = useResolvedForm(form)
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    // Handled here (not by the native reset event) so it also works outside the <form>.
    event.preventDefault()
    resetForm(resolved, to)
  }
  return (
    <Button ref={ref} type="reset" variant={variant} tone={tone} onClick={handleClick} {...rest}>
      {children ?? getFormRuntime(resolved).options.messages.reset}
    </Button>
  )
})
