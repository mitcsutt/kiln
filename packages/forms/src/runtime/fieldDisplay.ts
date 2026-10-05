import { pickErrors } from '#runtime/errors'
import { isErrorVisible, type VisibilityMeta } from '#runtime/visibility'
import { formatErrorText, type FormRuntime } from '#runtime/formRuntime'

export interface FieldDisplayInput {
  mode: 'edit' | 'view'
  /** disabled | readOnly | excluded: its errors are never shown. */
  inactive: boolean
  /** The field's meta: the visibility policy's inputs and its error map. */
  meta: VisibilityMeta & { errorMap: Record<string, unknown> }
  /** The form has had a submit attempt. */
  submitted: boolean
  /** The field's errors were revealed (a step's Next, a rejected file): visible under any policy. */
  revealed: boolean
  /** That reveal was a quiet scoped attempt: no per-field alert. */
  quiet: boolean
  /** The field's `warn` advice for its current value, when it has one. */
  warning: (() => string | null | undefined) | undefined
}

export interface FieldDisplay {
  showError: boolean
  /** The first visible error, formatted (`''` for an error with no text). */
  error: string | undefined
  /** Advice, shown under the same visibility rule while no error shows. */
  warning: string | undefined
  /** Whether an error that appears is announced (`role="alert"`). */
  errorLive: boolean
}

/**
 * What a field shows (§4.2.3–6): one visible error per field, warnings under the same
 * visibility rule while no error shows, and live announcements except after a submit or a quiet
 * scoped attempt, which announce once themselves and move focus.
 */
export function fieldDisplay(runtime: FormRuntime, input: FieldDisplayInput): FieldDisplay {
  const { mode, inactive, meta, submitted, revealed, quiet } = input
  const editing = mode === 'edit'
  const visible = revealed || isErrorVisible(runtime.options.errorVisibility, meta, submitted)
  const first = pickErrors(meta.errorMap)[0]
  const showError = editing && !inactive && first !== undefined && visible
  const warning = editing && !showError && visible ? (input.warning?.() ?? undefined) : undefined
  return {
    showError,
    error: showError ? formatErrorText(runtime, first) : undefined,
    warning: warning === '' ? undefined : warning,
    errorLive: !submitted && !quiet,
  }
}
