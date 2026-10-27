/**
 * Waits like a network request would. The demo has no server: every data module answers from
 * fixtures after a delay, so loading states show the way they would in a real app.
 */
export function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, ms)
  })
}
