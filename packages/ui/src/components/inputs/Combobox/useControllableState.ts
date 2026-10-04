import { useCallback, useState } from 'react'
import { useLatest } from '#components/inputs/internal/useLatest'

/**
 * Controlled/uncontrolled state in one hook (Radix naming): when `value` is defined the
 * caller owns it; otherwise it lives here, seeded from `defaultValue`. `setValue` always
 * calls `onChange`, and only updates local state when uncontrolled.
 *
 * Shared by Combobox, TagsInput and FileDrop (internal — not exported from the package).
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal

  // Keep the latest callback without re-creating the setter each render.
  const onChangeRef = useLatest(onChange)

  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInternal(next)
      onChangeRef.current?.(next)
    },
    [controlled, onChangeRef],
  )

  return [current, setValue]
}
