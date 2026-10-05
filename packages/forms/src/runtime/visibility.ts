/** The meta slices a visibility policy may read. */
export interface VisibilityMeta {
  isTouched: boolean
  isBlurred: boolean
  isDirty: boolean
}

/**
 * When a field's error becomes visible.
 * - `'blur'` (default): after the field is blurred, or after any submit attempt.
 * - `'change'`: after the first edit (TanStack's `isTouched`), or after any submit attempt.
 * - `'submit'`: only after a submit attempt.
 * - a function for anything else.
 */
export type ErrorVisibility =
  'blur' | 'change' | 'submit' | ((state: { meta: VisibilityMeta; submitted: boolean }) => boolean)

/** Applies a visibility policy. `submitted` = `submissionAttempts > 0`. */
export function isErrorVisible(
  policy: ErrorVisibility,
  meta: VisibilityMeta,
  submitted: boolean,
): boolean {
  if (typeof policy === 'function') return policy({ meta, submitted })
  if (submitted) return true
  switch (policy) {
    case 'blur':
      return meta.isBlurred
    case 'change':
      return meta.isTouched
    case 'submit':
      return false
  }
}
