import { useRef } from 'react'
import { evaluate, getBy } from '@tanstack/react-form'
import { isErrorVisible } from '#core/binding/visibility'
import { useIsomorphicLayoutEffect } from '#core/env'
import { coreApi, getFormRuntime, type AnyKitForm } from '#core/runtime/formRuntime'

export interface ServerValuesOptions {
  /** Keep the user's edits (paths that differ from the old baseline). Default `true`. */
  keepDirty?: boolean
  /** Restore errors that were visible before the refresh. Default `true`. */
  keepErrors?: boolean
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value) as unknown
  return proto === Object.prototype || proto === null
}

/**
 * Per leaf path: the user's value where it differs from the old baseline (dirty), otherwise the
 * new server value. Plain objects recurse; arrays and other values are leaves.
 */
export function mergeDirty(oldBaseline: unknown, current: unknown, next: unknown): unknown {
  if (isPlainObject(oldBaseline) && isPlainObject(current) && isPlainObject(next)) {
    const out: Record<string, unknown> = {}
    for (const key of new Set([...Object.keys(next), ...Object.keys(current)])) {
      out[key] = mergeDirty(oldBaseline[key], current[key], next[key])
    }
    return out
  }
  return evaluate(current, oldBaseline) ? next : current
}

interface MetaSnapshot {
  errorMap: Record<string, unknown>
  errorSourceMap: Record<string, unknown>
}

/**
 * Applies new server data as the form's baseline (§6.5): new defaults = `data`; values keep the
 * user's dirty edits; visible errors are restored.
 */
export function applyServerValues(
  target: AnyKitForm,
  data: unknown,
  opts: ServerValuesOptions = {},
): void {
  const form = coreApi(target)
  const { keepDirty = true, keepErrors = true } = opts
  const runtime = getFormRuntime(form)
  const state = form.state
  const merged = keepDirty ? mergeDirty(form.options.defaultValues, state.values, data) : data

  const restore = new Map<string, MetaSnapshot>()
  if (keepErrors) {
    const submitted = state.submissionAttempts > 0
    const fieldMeta = state.fieldMeta as Record<
      string,
      | (MetaSnapshot & {
          isTouched: boolean
          isBlurred: boolean
          isDirty: boolean
          errors: unknown[]
        })
      | undefined
    >
    for (const [name, meta] of Object.entries(fieldMeta)) {
      if (!meta || meta.errors.length === 0) continue
      if (!isErrorVisible(runtime.options.errorVisibility, meta, submitted)) continue
      restore.set(name, { errorMap: meta.errorMap, errorSourceMap: meta.errorSourceMap })
    }
  }

  runtime.baseline = { values: data, source: runtime.userDefaults }
  form.update({ ...form.options, defaultValues: data })
  form.reset(merged, { keepDefaultValues: true })

  for (const [name, snapshot] of restore) {
    if (getBy(merged, name) === undefined && getBy(data, name) === undefined) continue
    form.setFieldMeta(name, (prev) => ({
      ...prev,
      isTouched: true,
      isBlurred: true,
      errorMap: snapshot.errorMap,
      errorSourceMap: snapshot.errorSourceMap,
    }))
  }
}

/**
 * Edit mode bound to refreshing server data. Whenever `data` changes (deep compare) it
 * becomes the new baseline; untouched fields take the new values, edited ones keep the user's.
 */
export function useServerValues<A extends AnyKitForm>(
  form: A,
  data: A['state']['values'] | undefined,
  opts: ServerValuesOptions = {},
): void {
  const { keepDirty = true, keepErrors = true } = opts
  const applied = useRef<{ data: unknown } | null>(null)
  useIsomorphicLayoutEffect(() => {
    if (data === undefined) return
    if (applied.current && evaluate(applied.current.data, data)) return
    const first = applied.current === null
    applied.current = { data }
    // The first snapshot equal to the defaults needs no work.
    if (first && evaluate(coreApi(form).options.defaultValues, data)) return
    applyServerValues(form, data, { keepDirty, keepErrors })
  }, [form, data, keepDirty, keepErrors])
}
