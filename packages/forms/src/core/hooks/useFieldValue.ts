import { getBy, useSelector, type DeepKeys, type DeepValue } from '@tanstack/react-form'
import { toFormApi, type AnyKitForm } from '#core/runtime/formRuntime'

/**
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
