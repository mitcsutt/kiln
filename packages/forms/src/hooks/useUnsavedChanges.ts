import { useEffect } from 'react'
import { useSelector } from '@tanstack/react-form'
import { toFormApi, type AnyKitForm } from '#runtime/formRuntime'

/**
 * Ask before the reader leaves a form with unsaved changes, and tell your router the same.
 *
 * @remarks
 * `useUnsavedChanges(form)` adds a `beforeunload` prompt while the form differs from its baseline,
 * so closing or reloading the tab asks first. It returns whether the form is dirty, so your
 * router's own navigation blocker can use the same answer.
 *
 * @privateRemarks
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
