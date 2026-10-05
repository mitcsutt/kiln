/**
 * Shallow equality for `useSelector(store, sel, { compare: shallowEqual })` — objects by own keys,
 * arrays by index, everything else by `Object.is`. (No `@tanstack/react-store` dependency.)
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((value, index) => Object.is(value, b[index]))
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    for (const [key, value] of a) if (!b.has(key) || !Object.is(value, b.get(key))) return false
    return true
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false
    for (const value of a) if (!b.has(value)) return false
    return true
  }
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  const recordA = a as Record<string, unknown>
  const recordB = b as Record<string, unknown>
  return keysA.every(
    (key) => Object.prototype.hasOwnProperty.call(b, key) && Object.is(recordA[key], recordB[key]),
  )
}
