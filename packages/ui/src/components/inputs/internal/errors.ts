import type { ReactNode } from 'react'

/** `error` counts as invalid unless it is empty, `false` or nullish. */
export function hasError(error: ReactNode): boolean {
  return error !== undefined && error !== null && error !== false && error !== ''
}

/** Whether there is a message to show (`error={true}` flags invalid without text). */
export function hasErrorMessage(error: ReactNode): boolean {
  return hasError(error) && error !== true
}
