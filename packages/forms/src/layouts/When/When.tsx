import { useMemo, useState, type ReactNode } from 'react'
import { getBy, useSelector, type AnyFormApi, type DeepKeys } from '@tanstack/react-form'
import { useIsomorphicLayoutEffect } from '#core/env'
import type { AnyKitForm, ValuesOf } from '#core/kit/types'
import { coreApi, getFormRuntime, markInactive, toFormApi } from '#core/runtime/formRuntime'
import { FieldScope } from '#core/scope/FieldScope'
import type { ScopeNamesProps } from '#layouts/internal/types'
import { evaluateCondition } from '#schema/core/conditions'
import type { Condition } from '#schema/core/types'

/** What happens to hidden fields' values (§5.4). */
export type WhenHidden = 'prune' | 'keep' | 'reset'

export interface WhenProps<A extends AnyKitForm> extends ScopeNamesProps {
  form: A
  /** Component mode: visible while this returns `true`. Subscribes with a boolean selector. */
  is?: (values: ValuesOf<A>) => boolean
  /** Or a JSON condition (the schema-mode `Condition`). Ignored when `is` is given. */
  condition?: Condition<ValuesOf<A>>
  /** @internal Schema mode: the render `context` that `context` conditions read. */
  context?: Record<string, unknown>
  /**
   * `'prune'` (default): submitted as the field's default; the user's input survives hide/show.
   * `'keep'`: submitted as the current value. `'reset'`: reset to the default when hidden.
   */
  whenHidden?: WhenHidden
  /** Paths it governs that may never have mounted (edit mode with a hidden server value). */
  names?: readonly DeepKeys<ValuesOf<A>>[]
  /** Rendered instead while hidden. */
  fallback?: ReactNode
  children: ReactNode
}

/** Writes each path's default (field-level default first, then the form's) into the values. */
function resetToDefaults(form: AnyKitForm, names: readonly string[]): void {
  const api = toFormApi(form)
  const runtime = getFormRuntime(form)
  const defaults: unknown = coreApi(form).options.defaultValues
  for (const name of names) {
    const fallback: unknown = runtime.fieldDefaults.has(name)
      ? runtime.fieldDefaults.get(name)
      : getBy(defaults, name)
    ;(
      api as unknown as {
        setFieldValue(name: string, value: unknown, opts: { dontUpdateMeta: boolean }): void
      }
    ).setFieldValue(name, fallback, { dontUpdateMeta: true })
  }
}

const NO_NAMES: readonly string[] = []

/**
 * Conditional rendering (§6.6). Children unmount while `is(values)` (or `condition`) is false (their validators
 * stop) and every path they governed — collected from the fields mounted inside, remembered after
 * they hide, plus `names` — becomes inactive with the `whenHidden` policy: errors cleared, and
 * the submitted value pruned to the default (`prune`), kept (`keep`) or reset now (`reset`).
 * Re-renders only when visibility flips.
 */
export function When<A extends AnyKitForm>({
  form,
  is,
  condition,
  context,
  whenHidden = 'prune',
  names,
  scopeNames,
  fallback,
  children,
}: WhenProps<A>): ReactNode {
  const api: AnyFormApi = toFormApi(form)
  const visible = useSelector(api.store, (state) => {
    if (is) return is(state.values as ValuesOf<A>)
    if (condition) return evaluateCondition(condition, state.values, context)
    return true
  })

  const namesKey = [...(names ?? []), ...(scopeNames ?? [])].join('\u0000')
  const staticNames = useMemo(
    () => (namesKey === '' ? NO_NAMES : namesKey.split('\u0000')),
    [namesKey],
  )
  const [governed, setGoverned] = useState<readonly string[]>(staticNames)

  useIsomorphicLayoutEffect(() => {
    if (visible || governed.length === 0) return undefined
    if (whenHidden === 'reset') resetToDefaults(form, governed)
    return markInactive(form, governed, 'hidden', whenHidden === 'keep' ? 'keep' : 'prune')
  }, [visible, governed, whenHidden, form])

  return (
    <>
      <FieldScope names={staticNames} onNamesChange={setGoverned}>
        {visible ? children : null}
      </FieldScope>
      {visible ? null : fallback}
    </>
  )
}
