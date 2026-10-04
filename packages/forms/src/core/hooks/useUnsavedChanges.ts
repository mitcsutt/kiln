import { useEffect } from 'react'
import { useSelector } from '@tanstack/react-form'
import { toFormApi, type AnyKitForm } from '#core/runtime/formRuntime'

/**
 * Guards against leaving with unsaved changes: a `beforeunload` prompt while the form differs
 * from its baseline. Returns `isDirty` so router blockers can use it too.
 */
export function useUnsavedChanges(form: AnyKitForm, opts: { when?: boolean } = {}): boolean {
  const isDirty = useSelector(toFormApi(form).store, (state) => !state.isDefaultValue)
  const active = (opts.when ?? true) && isDirty
  useEffect(() => {
    if (!active || typeof window === 'undefined') return undefined
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Legacy browsers need a returnValue to show the prompt.
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- see above
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [active])
  return isDirty
}
