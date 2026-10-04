import type { DeepKeys } from '@tanstack/react-form'
import { toFormApi, type AnyKitForm } from '#core/runtime/formRuntime'
import { normalisePath } from '#core/runtime/paths'

/** Server-side errors: one form-level message and/or messages per field path. */
export interface ServerErrors<T = unknown> {
  form?: string
  fields?: Partial<Record<DeepKeys<T>, string>>
}

/**
 * Throw from `onSubmit` to map server errors onto the form (§5.5): field errors go to each
 * field's `onServer` slot (cleared on its next change), the form error to the form's.
 */
export class FormSubmitError<T = unknown> extends Error {
  readonly errors: ServerErrors<T>

  constructor(errors: ServerErrors<T>, message?: string) {
    super(message ?? errors.form ?? 'The server rejected the submission')
    this.name = 'FormSubmitError'
    this.errors = errors
  }
}

type ValuesOfForm<A> = A extends { state: { values: infer V } } ? V : never

/**
 * Applies server errors: field messages → each field's `onServer` slot (source `field`, so other
 * fields' edits don't clear them); the form message (plus any message for a path with no field)
 * → the form's `onServer` slot.
 */
export function applyServerErrors<A extends AnyKitForm>(
  target: A,
  errors: ServerErrors<ValuesOfForm<A>>,
): void {
  const form = toFormApi(target)
  const formMessages: string[] = []
  if (errors.form) formMessages.push(errors.form)
  const fields = (errors.fields ?? {}) as Record<string, string | undefined>
  for (const [rawName, message] of Object.entries(fields)) {
    if (!message) continue
    const name = normalisePath(rawName)
    if (!form.getFieldMeta(name)) {
      formMessages.push(message)
      continue
    }
    form.setFieldMeta(name, (prev) => ({
      ...prev,
      errorMap: { ...prev.errorMap, onServer: message },
      errorSourceMap: { ...prev.errorSourceMap, onServer: 'field' },
    }))
  }
  form.setErrorMap({ onServer: formMessages.length === 0 ? undefined : formMessages })
}
