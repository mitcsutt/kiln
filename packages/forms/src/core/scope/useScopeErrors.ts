import { useSyncExternalStore } from 'react'
import { useSelector } from '@tanstack/react-form'
import { pickErrors } from '#core/binding/errors'
import type { VisibilityMeta } from '#core/binding/visibility'
import {
  getFormRuntime,
  isInactive,
  useResolvedForm,
  useRuntimeVersion,
  type AnyKitForm,
} from '#core/runtime/formRuntime'
import { areErrorsVisible } from '#core/runtime/reveal'
import type { ScopeHandle } from '#core/scope/FieldScope'

const noop = () => () => undefined
const EMPTY: readonly string[] = []

interface MetaLike extends VisibilityMeta {
  errorMap?: Record<string, unknown>
}

/**
 * The number of **visible** errors (per the form's visibility policy) among the scope's fields.
 * A primitive selector — re-renders only when the count changes.
 */
export function useScopeErrors(scope: ScopeHandle | null, form?: AnyKitForm): number {
  const resolved = useResolvedForm(form)
  const runtime = getFormRuntime(resolved)
  useRuntimeVersion(runtime)
  const names = useSyncExternalStore(
    scope ? scope.subscribe : noop,
    () => (scope ? scope.names() : EMPTY),
    () => (scope ? scope.names() : EMPTY),
  )
  return useSelector(resolved.store, (state) => {
    if (names.length === 0) return 0
    const submitted = state.submissionAttempts > 0
    const fieldMeta = state.fieldMeta as Record<string, MetaLike | undefined>
    let count = 0
    for (const name of names) {
      const meta = fieldMeta[name]
      if (!meta || isInactive(runtime, name)) continue
      if (pickErrors(meta.errorMap).length === 0) continue
      // Revealed by a scoped attempt (a step's Next) = visible under any policy.
      if (areErrorsVisible(runtime, meta, submitted)) count += 1
    }
    return count
  })
}
