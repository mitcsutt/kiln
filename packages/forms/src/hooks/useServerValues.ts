import { useRef } from 'react'
import { evaluate, getBy } from '@tanstack/react-form'
import { pickErrors } from '#runtime/errors'
import type { VisibilityMeta } from '#runtime/visibility'
import { useIsomorphicLayoutEffect } from '#utils/env'
import { coreApi, getFormRuntime, type AnyKitForm } from '#runtime/formRuntime'
import { areErrorsVisible, isQuietMeta, revealFieldErrors } from '#runtime/reveal'

export interface ServerValuesOptions {
  /** Keep the user's edits (paths that differ from the old baseline). Default `true`. */
  keepDirty?: boolean
  /**
   * Keep errors that were visible before the refresh, on values the refresh left alone, each
   * announced (or quiet) as it was before. Default `true`.
   */
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

interface KeptErrors {
  name: string
  errorMap: Record<string, unknown>
  errorSourceMap: Record<string, unknown>
  quiet: boolean
}

/**
 * Applies new server data as the form's baseline (§6.5): new defaults = `data`; values keep the
 * user's dirty edits; errors the user could see stay visible where the refresh kept the value
 * they were about (one the refresh replaced is no longer that error's value).
 */
export function applyServerValues(
  target: AnyKitForm,
  data: unknown,
  opts: ServerValuesOptions = {},
): void {
  const form = coreApi(target)
  const { keepDirty = true, keepErrors = true } = opts
  const runtime = getFormRuntime(form)
  const { fieldMeta } = form.state
  const submitted = form.state.submissionAttempts > 0
  const values: unknown = form.state.values
  const merged = keepDirty ? mergeDirty(form.options.defaultValues, values, data) : data

  const kept: KeptErrors[] = []
  if (keepErrors) {
    const metas = fieldMeta as Record<string, (VisibilityMeta & KeptErrors) | undefined>
    for (const [name, meta] of Object.entries(metas)) {
      if (!meta || pickErrors(meta.errorMap).length === 0) continue
      if (!areErrorsVisible(runtime, meta, submitted)) continue
      if (!evaluate(getBy(merged, name), getBy(values, name))) continue
      kept.push({
        name,
        errorMap: meta.errorMap,
        errorSourceMap: meta.errorSourceMap,
        quiet: submitted || isQuietMeta(meta),
      })
    }
  }

  runtime.baseline = { values: data, source: runtime.userDefaults }
  form.update({ ...form.options, defaultValues: data })
  // Resets every field's meta and the submit count, so kept errors are revealed again below
  // (quiet where a submit or a scoped attempt had quieted them; otherwise live, as they were).
  form.reset(merged, { keepDefaultValues: true })

  for (const { name, errorMap, errorSourceMap } of kept) {
    form.setFieldMeta(name, (prev) => ({ ...prev, errorMap, errorSourceMap }))
  }
  for (const quiet of [true, false]) {
    revealFieldErrors(
      form,
      kept.filter((k) => k.quiet === quiet).map(({ name }) => name),
      { quiet },
    )
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
