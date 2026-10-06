import { forwardRef, useId, type MouseEvent } from 'react'
import { useSelector } from '@tanstack/react-form'
import { Button, VisuallyHidden, type ButtonProps } from '@mitcsutt/kiln-ui'
import {
  getFormRuntime,
  useResolvedForm,
  useRuntimeValue,
  type AnyKitForm,
} from '#runtime/formRuntime'

export interface SubmitButtonProps extends Omit<
  ButtonProps,
  'type' | 'form' | 'asChild' | 'loading' | 'disabled'
> {
  /** Defaults to the form in context. Required for a button outside `<Form>`. */
  form?: AnyKitForm
  /** The `id` of the `<Form>` to submit from outside it (native `form` attribute). */
  formId?: string
  /** Stays `aria-disabled` (with a spoken reason) until something changed. */
  requireChanges?: boolean
  /** Meta passed to `onSubmit` for this button (`form.handleSubmit(meta)`). */
  submitMeta?: unknown
}

function joinIds(...ids: (string | false | undefined)[]): string | undefined {
  const joined = ids.filter((id): id is string => typeof id === 'string' && id !== '').join(' ')
  return joined === '' ? undefined : joined
}

/**
 * Submits the form. Never disabled, so everyone can reach it and hear why it's waiting.
 *
 * @remarks
 * `SubmitButton` is a `Button` with `type="submit"` that knows the form's state. It shows a
 * spinner while submitting. It's **never `disabled`**: when it can't act (while submitting, after
 * a locking submit, or with `requireChanges` before anything has changed) it's `aria-disabled`,
 * ignores presses, and carries a visually hidden reason. A disabled button can't be focused, so
 * keyboard and screen reader users would never find out why they can't go on.
 *
 * @example In a schema
 * ```json
 * { "content": "submit", "label": "Book ticket" }
 * ```
 *
 * @privateRemarks
 * The submit button. **Never `disabled`** (§11.6): while submitting, locked, or blocked by
 * `requireChanges` it is `aria-disabled` and ignores clicks; an invalid form still submits so
 * errors show and focus moves.
 */
export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(function SubmitButton(
  {
    form,
    formId,
    requireChanges = false,
    submitMeta,
    onClick,
    children,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const resolved = useResolvedForm(form)
  const runtime = getFormRuntime(resolved)
  const locked = useRuntimeValue(runtime, (current) => current.locked)
  const isSubmitting = useSelector(resolved.store, (state) => state.isSubmitting)
  // Only subscribed when `requireChanges` needs it: otherwise the first keystroke would
  // re-render every submit button for nothing (§12).
  const noChanges = useSelector(resolved.store, (state) => requireChanges && state.isDefaultValue)
  const reasonId = useId()
  const inert = isSubmitting || locked || noChanges
  const messages = runtime.options.messages

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (inert) {
      event.preventDefault()
      return
    }
    if (submitMeta !== undefined) {
      event.preventDefault()
      resolved.handleSubmit(submitMeta).catch((error: unknown) => {
        console.error(error)
      })
    }
  }

  return (
    <>
      {/* asChild: Button's loading state becomes aria-disabled + spinner, never the disabled attribute. */}
      <Button ref={ref} asChild loading={isSubmitting} {...rest}>
        <button
          type="submit"
          form={formId}
          aria-disabled={inert || undefined}
          aria-describedby={joinIds(describedBy, noChanges && reasonId)}
          onClick={handleClick}
        >
          {children ?? messages.submit}
        </button>
      </Button>
      {noChanges ? <VisuallyHidden id={reasonId}>{messages.noChanges}</VisuallyHidden> : null}
    </>
  )
})
