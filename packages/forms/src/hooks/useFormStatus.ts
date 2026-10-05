import { useMemo } from 'react'
import { useSelector } from '@tanstack/react-form'
import { useResolvedForm, type AnyKitForm } from '#runtime/formRuntime'

export interface FormStatusState {
  /** `!isDefaultValue` — differs from the baseline (never TanStack's persistent `isDirty`). */
  isDirty: boolean
  isSubmitting: boolean
  isSubmitted: boolean
  isSubmitSuccessful: boolean
  /** Not submitting/validating, and valid (or never submitted). Ignores `canSubmitWhenInvalid`. */
  canSubmit: boolean
  submitCount: number
  isValidating: boolean
  hasErrors: boolean
}

/**
 * The form's state at a glance (dirty, submitting, submitted, valid), re-rendering only when a
 * part of it changes.
 *
 * @remarks
 * `useFormStatus` reads the form-wide state you build interface around: whether it's dirty,
 * submitting or submitted, whether it can submit, and how many times it's been submitted. Each
 * part is its own selector and the result is memoised, so a component using it re-renders only
 * when something it reads actually changes.
 *
 * @privateRemarks
 * Form-wide status; each slice is its own primitive selector, the object is memoised (§6.5).
 */
export function useFormStatus(form?: AnyKitForm): FormStatusState {
  const resolved = useResolvedForm(form)
  const store = resolved.store
  const isDirty = useSelector(store, (s) => !s.isDefaultValue)
  const isSubmitting = useSelector(store, (s) => s.isSubmitting)
  const isSubmitted = useSelector(store, (s) => s.isSubmitted)
  const isSubmitSuccessful = useSelector(store, (s) => s.isSubmitSuccessful)
  const submitCount = useSelector(store, (s) => s.submissionAttempts)
  const isValidating = useSelector(
    store,
    (s) => s.isValidating || s.isFieldsValidating || s.isFormValidating,
  )
  const hasErrors = useSelector(store, (s) => !s.isValid)
  const canSubmit = !isSubmitting && !isValidating && (submitCount === 0 || !hasErrors)
  return useMemo(
    () => ({
      isDirty,
      isSubmitting,
      isSubmitted,
      isSubmitSuccessful,
      canSubmit,
      submitCount,
      isValidating,
      hasErrors,
    }),
    [
      isDirty,
      isSubmitting,
      isSubmitted,
      isSubmitSuccessful,
      canSubmit,
      submitCount,
      isValidating,
      hasErrors,
    ],
  )
}
