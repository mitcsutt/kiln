import { coreApi, getFormRuntime, type AnyKitForm } from '#runtime/formRuntime'

/**
 * Makes `values` the form's new defaults (the baseline `isDirty` compares against).
 * - default: `form.reset(values)` — values and meta reset, the form is clean.
 * - `keepValues`: only the defaults move; the current values (and meta) stay, so edits made
 *   meanwhile still read as dirty.
 * The baseline survives re-renders of the host until the app passes different `defaultValues`.
 */
export function rebaseline(
  target: AnyKitForm,
  values: unknown,
  opts: { keepValues?: boolean } = {},
): void {
  const form = coreApi(target)
  const runtime = getFormRuntime(form)
  runtime.baseline = { values, source: runtime.userDefaults }
  if (opts.keepValues) {
    form.update({ ...form.options, defaultValues: values })
    // `isDefaultValue` is derived on store changes; nudge the store so it recomputes.
    form.baseStore.setState((prev) => ({ ...prev }))
  } else {
    form.reset(values)
  }
}

/**
 * Resets the form. `'baseline'` (default): to the current baseline (the defaults, or the values
 * last rebaselined to). `'defaults'`: to the app's original `defaultValues`, dropping any baseline.
 */
export function resetForm(target: AnyKitForm, to: 'baseline' | 'defaults' = 'baseline'): void {
  const form = coreApi(target)
  const runtime = getFormRuntime(form)
  if (to === 'defaults' && runtime.baseline) {
    runtime.baseline = null
    if (runtime.userDefaults !== undefined)
      form.update({ ...form.options, defaultValues: runtime.userDefaults })
  }
  form.reset()
}
