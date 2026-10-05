import type { AnyFormApi } from '@tanstack/react-form'
import { isErrorVisible, type VisibilityMeta } from '#core/binding/visibility'
import type { FormRuntime } from '#core/runtime/formRuntime'

// Field meta marks set by `revealFieldErrors`. `form.reset()` clears them with the rest of the meta.
const REVEALED = '~revealed'
const QUIET = '~revealedQuietly'

function flag(meta: unknown, key: string): boolean {
  return (
    typeof meta === 'object' && meta !== null && (meta as Record<string, unknown>)[key] === true
  )
}

/** Whether a field meta carries the "errors revealed" mark set by `revealFieldErrors`. */
export function isRevealedMeta(meta: unknown): boolean {
  return flag(meta, REVEALED)
}

/** Whether the reveal was a scoped attempt that announces once itself (no per-field alerts). */
export function isQuietMeta(meta: unknown): boolean {
  return flag(meta, QUIET)
}

export interface RevealOptions {
  /**
   * A scoped submit attempt (a step's Next): like a submit, the fields' errors render without
   * `role="alert"` — the attempt moves focus to the first invalid field / announces
   * once itself, so N simultaneous alerts would only bury it. Default `false`: a reveal in
   * response to one field's own event (a rejected file) announces as usual.
   */
  quiet?: boolean
}

/**
 * Makes these fields' errors visible regardless of the visibility policy — a scoped submit
 * attempt (a step's Next), or an immediate response to the user's action (a rejected file).
 * Marks them touched + blurred and sets a meta flag that bindings OR into `submitted`;
 * `form.reset()` clears it with the rest of the meta.
 */
export function revealFieldErrors(
  form: AnyFormApi,
  names: readonly string[],
  options: RevealOptions = {},
): void {
  const quiet = options.quiet === true
  for (const name of names) {
    form.setFieldMeta(name, (prev) => {
      if (prev.isTouched && prev.isBlurred && isRevealedMeta(prev) && isQuietMeta(prev) === quiet)
        return prev
      return { ...prev, isTouched: true, isBlurred: true, [REVEALED]: true, [QUIET]: quiet }
    })
  }
}

/** Whether a field's errors show: revealed, or allowed by the form's `errorVisibility` policy. */
export function areErrorsVisible(
  runtime: FormRuntime,
  meta: VisibilityMeta,
  submitted: boolean,
): boolean {
  return isRevealedMeta(meta) || isErrorVisible(runtime.options.errorVisibility, meta, submitted)
}
