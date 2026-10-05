import {
  forwardRef,
  useCallback,
  type SyntheticEvent,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react'
import { useSelector } from '@tanstack/react-form'
import { formContext } from '#kit/contexts'
import { FieldPresentation } from '#components/fields/FieldPresentation'
import { resetForm } from '#runtime/baseline'
import { getFormRuntime, toFormApi, type AnyKitForm } from '#runtime/formRuntime'

export interface FormProps extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'onReset' | 'children'
> {
  /** The form from `useAppForm` (or any TanStack form). */
  form: AnyKitForm
  /** `view` renders every field's display value instead of its control. */
  mode?: 'edit' | 'view'
  /** Disables every field inside (not focusable, not validated, submitted as-is). */
  disabled?: boolean
  /** Makes every field read-only (focusable, not editable, not validated). */
  readOnly?: boolean
  children: ReactNode
}

/**
 * `<form noValidate>` wired to the kit: submit runs the pipeline (§5.5) and is ignored while a
 * submit is in flight or the form is locked; reset returns to the baseline. Provides the form
 * to `useFormContext()` and cascades `mode` / `disabled` / `readOnly` to fields.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { form, mode, disabled, readOnly, children, ...rest },
  ref,
) {
  const api = toFormApi(form)
  const runtime = getFormRuntime(api)
  const isSubmitting = useSelector(api.store, (state) => state.isSubmitting)

  const setRef = useCallback(
    (element: HTMLFormElement | null) => {
      runtime.formElement = element
      if (typeof ref === 'function') ref(element)
      else if (ref) ref.current = element
    },
    [runtime, ref],
  )

  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (api.state.isSubmitting || runtime.locked) return
    api.handleSubmit().catch((error: unknown) => {
      console.error(error)
    })
  }

  const onReset = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetForm(form, 'baseline')
  }

  return (
    <form
      ref={setRef}
      noValidate
      aria-busy={isSubmitting || undefined}
      onSubmit={onSubmit}
      onReset={onReset}
      {...rest}
    >
      <formContext.Provider value={api}>
        <FieldPresentation mode={mode} disabled={disabled} readOnly={readOnly}>
          {children}
        </FieldPresentation>
      </formContext.Provider>
    </form>
  )
})
