import { useEffect, useLayoutEffect } from 'react'

/** True in development builds (Vite / Vitest set `import.meta.env.DEV`). */
export function isDev(): boolean {
  try {
    return import.meta.env.DEV
  } catch {
    return false
  }
}

/** `useLayoutEffect` in the browser, `useEffect` on the server (no SSR warning). */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
