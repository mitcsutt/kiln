import type { KitFormOptions } from '#kit/types'

/** Typed identity for sharing options between `useAppForm` and `withForm` (§3.5). */
export function formOptions<T, O = T, M = undefined>(
  options: KitFormOptions<T, O, M>,
): KitFormOptions<T, O, M> {
  return options
}
