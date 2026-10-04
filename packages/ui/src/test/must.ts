/** Returns a value a test needs to exist, or fails the test with a clear message. */
export function must<T>(value: T | null | undefined, what = 'the element'): T {
  if (value === null || value === undefined) throw new Error(`Expected ${what} to exist`)
  return value
}
