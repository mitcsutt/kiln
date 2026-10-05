import { useCallback, useSyncExternalStore } from 'react'
import { pickErrors } from '#runtime/errors'
import type { VisibilityMeta } from '#runtime/visibility'
import { getFormRuntime, isInactive, useResolvedForm, type AnyKitForm } from '#runtime/formRuntime'
import { areErrorsVisible } from '#runtime/reveal'
import type { ScopeHandle } from '#components/layouts/FieldScope'

interface MetaLike extends VisibilityMeta {
  errorMap?: Record<string, unknown>
}

/**
 * The number of **visible** errors (per the form's visibility policy) among the scope's fields.
 * It depends on the form's state, the runtime's inactive paths and the scope's names, and is
 * read from all three as one number: it re-renders only when the count changes.
 */
export function useScopeErrors(scope: ScopeHandle | null, form?: AnyKitForm): number {
  const resolved = useResolvedForm(form)
  const runtime = getFormRuntime(resolved)
  const subscribe = useCallback(
    (onChange: () => void) => {
      const store = resolved.store.subscribe(onChange)
      const unsubscribeRuntime = runtime.subscribe(onChange)
      const unsubscribeScope = scope?.subscribe(onChange)
      return () => {
        store.unsubscribe()
        unsubscribeRuntime()
        unsubscribeScope?.()
      }
    },
    [resolved, runtime, scope],
  )
  const count = () => {
    const names = scope?.names() ?? []
    if (names.length === 0) return 0
    const state = resolved.store.state
    const submitted = state.submissionAttempts > 0
    const fieldMeta = state.fieldMeta as Record<string, MetaLike | undefined>
    let visible = 0
    for (const name of names) {
      const meta = fieldMeta[name]
      if (!meta || isInactive(runtime, name)) continue
      if (pickErrors(meta.errorMap).length === 0) continue
      // Revealed by a scoped attempt (a step's Next) = visible under any policy.
      if (areErrorsVisible(runtime, meta, submitted)) visible += 1
    }
    return visible
  }
  return useSyncExternalStore(subscribe, count, count)
}
