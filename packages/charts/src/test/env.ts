/** The size every element reports in jsdom (`setup.ts`), so charts draw in tests. */
export const TEST_WIDTH = 640
export const TEST_HEIGHT = 320

let reducedMotion = false

/** What `matchMedia('(prefers-reduced-motion: reduce)')` answers; reset after each test. */
export function setReducedMotion(on: boolean): void {
  reducedMotion = on
}

export function isReducedMotion(): boolean {
  return reducedMotion
}
