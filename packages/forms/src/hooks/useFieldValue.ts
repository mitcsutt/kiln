import { getBy, useSelector, type DeepKeys, type DeepValue } from '@tanstack/react-form'
import { toFormApi, type AnyKitForm } from '#runtime/formRuntime'

/**
 * One value from the form, for rendering that depends on it, re-rendering only when it changes.
 *
 * @remarks
 * `useFieldValue(form, name)` subscribes to one path and returns its value, typed to that path.
 * Use it when one field's label, placeholder or options depend on another's value.
 *
 * @privateRemarks
 * One path's value, subscribed with a single selector — for sibling-aware rendering.
 * Re-renders only when that value changes (`===`).
 */
export function useFieldValue<A extends AnyKitForm, N extends DeepKeys<A['state']['values']>>(
  form: A,
  name: N,
): DeepValue<A['state']['values'], N> {
  return useSelector(
    toFormApi(form).store,
    (state) => getBy(state.values, name) as DeepValue<A['state']['values'], N>,
  )
}
