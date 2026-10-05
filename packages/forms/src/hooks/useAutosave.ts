import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnyFormApi } from '@tanstack/react-form'
import { rebaseline } from '#runtime/baseline'
import { coreApi, getFormRuntime, type AnyKitForm, type AutosaveStatus } from '#runtime/formRuntime'

export interface AutosaveOptions {
  /** Default 800. */
  debounceMs?: number
  /**
   * Skip saving while the form has errors. Default `true`. Before each save it runs every edited
   * field's validators and the form-level ones (schema included) with cause `change`, even before a
   * field's first blur, so a stale `isValid` never lets an invalid value through. Errors it finds
   * stay hidden until the form's `errorVisibility` shows them.
   */
  onlyWhenValid?: boolean
  /** After a save, the saved values become the baseline (clean). Default `true`. */
  rebaseline?: boolean
}

export interface AutosaveState {
  status: AutosaveStatus
  error?: unknown
  /** Save now (skips the debounce). */
  flush: () => void
}

interface ValidatableField {
  validate(cause: 'change', opts: { skipFormValidation: boolean }): unknown
}

/**
 * Validates the form for an autosave: touched fields' validators and the form-level
 * validators, cause `change`, with `onDynamic` forced on. Untouched fields hold their defaults and
 * TanStack never validates a pristine field. Resolves to the form's validity afterwards.
 */
async function validateForSave(form: AnyFormApi): Promise<boolean> {
  const runtime = getFormRuntime(form)
  const pending: Promise<unknown>[] = []
  runtime.forceDynamic = true
  try {
    const fields = form.fieldInfo as Record<
      string,
      { instance?: ValidatableField | null } | undefined
    >
    for (const info of Object.values(fields)) {
      const instance = info?.instance
      if (instance)
        pending.push(Promise.resolve(instance.validate('change', { skipFormValidation: true })))
    }
    pending.push(Promise.resolve(form.validate('change')))
  } finally {
    runtime.forceDynamic = false
  }
  await Promise.all(pending)
  return form.state.isValid
}

/**
 * Save as the reader types, debounced, aborting a save a newer one replaces, and only when the
 * form is valid.
 *
 * @remarks
 * `useAutosave(form, save, options)` calls `save` with the form's values after a quiet moment. A
 * newer save aborts the one in flight (through the `signal` it's given), a successful save makes
 * the saved values the new clean baseline, and the status (saving, saved, failed) is reported to
 * {@link FormStatus | `FormStatus`}.
 *
 * @privateRemarks
 * Debounced save of dirty values: aborts an in-flight save when a newer one starts,
 * rebaselines on success, and reports status to `FormStatus` through the form runtime.
 */
export function useAutosave<A extends AnyKitForm>(
  target: A,
  save: (value: A['state']['values'], ctx: { signal: AbortSignal }) => Promise<unknown>,
  opts: AutosaveOptions = {},
): AutosaveState {
  const { debounceMs = 800, onlyWhenValid = true, rebaseline: shouldRebaseline = true } = opts
  const [state, setState] = useState<{ status: AutosaveStatus; error?: unknown }>({
    status: 'idle',
  })
  const saveRef = useRef(save)
  const runRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    saveRef.current = save
  })

  useEffect(() => {
    const form = coreApi(target)
    const runtime = getFormRuntime(form)
    let timer: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | null = null
    let lastValues: unknown = form.state.values
    let disposed = false

    const report = (status: AutosaveStatus, error?: unknown) => {
      if (disposed) return
      runtime.autosave = status
      runtime.notify()
      setState(error === undefined ? { status } : { status, error })
    }

    const saveNow = () => {
      const current = form.state
      if (current.isDefaultValue) return
      controller?.abort()
      const own = new AbortController()
      controller = own
      const values = current.values as A['state']['values']
      report('saving')
      saveRef.current(values, { signal: own.signal }).then(
        () => {
          if (own.signal.aborted) return
          if (shouldRebaseline) {
            lastValues = values
            rebaseline(form, values, { keepValues: true })
          }
          report('saved')
        },
        (error: unknown) => {
          if (own.signal.aborted) return
          report('error', error)
        },
      )
    }

    const run = () => {
      if (timer) clearTimeout(timer)
      timer = undefined
      if (form.state.isDefaultValue) return
      if (!onlyWhenValid) {
        saveNow()
        return
      }
      const checked: unknown = form.state.values
      void validateForSave(form).then(
        (valid) => {
          // A newer edit while validating schedules its own run; never save values that weren't checked.
          if (disposed || !valid || form.state.values !== checked) return
          saveNow()
        },
        (error: unknown) => {
          report('error', error)
        },
      )
    }
    runRef.current = run

    const subscription = form.store.subscribe(() => {
      const values: unknown = form.state.values
      if (values === lastValues) return
      lastValues = values
      if (form.state.isDefaultValue) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(run, debounceMs)
    })

    return () => {
      disposed = true
      if (timer) clearTimeout(timer)
      controller?.abort()
      subscription.unsubscribe()
    }
  }, [target, debounceMs, onlyWhenValid, shouldRebaseline])

  const flush = useCallback(() => {
    runRef.current()
  }, [])
  return state.error === undefined
    ? { status: state.status, flush }
    : { status: state.status, error: state.error, flush }
}
