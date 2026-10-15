import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatest } from '#components/inputs/internal/useLatest'

export interface UseClipboardOptions {
  /** How long `copied` (or `error`) stays set after a copy, in ms. Default `1500`. */
  timeout?: number
  /** Called with the text once it's on the clipboard: raise a toast, log an event. */
  onCopy?: (text: string) => void
  /** Called when the copy fails, with the reason. */
  onError?: (error: Error) => void
}

export interface UseClipboardResult {
  /**
   * Copies `value`, or what `value()` returns at the moment of the call. Resolves to `true` once
   * the text is on the clipboard, or `false` if it couldn't be copied.
   */
  copy: (value: string | (() => string)) => Promise<boolean>
  /** `true` for `timeout` ms after a successful copy. */
  copied: boolean
  /** Why the last copy failed, for `timeout` ms after it. `null` otherwise. */
  error: Error | null
  /** Clear `copied` and `error` now. */
  reset: () => void
}

/**
 * Copies with a hidden textarea and `execCommand('copy')`: the path for pages without the
 * Clipboard API (served over plain HTTP) or where it's refused. Keeps the reader's focus and
 * selection.
 */
function copyWithTextarea(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false
  const active = document.activeElement
  const selection = document.getSelection()
  const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.setAttribute('aria-hidden', 'true')
  area.style.position = 'fixed'
  area.style.insetBlockStart = '0'
  area.style.opacity = '0'
  area.style.pointerEvents = 'none'
  document.body.append(area)
  area.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  area.remove()
  if (range && selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }
  if (active instanceof HTMLElement) active.focus({ preventScroll: true })
  return ok
}

/** Writes `text` to the clipboard, through the Clipboard API where it's available. */
async function writeClipboard(text: string): Promise<void> {
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
  // `navigator.clipboard` is missing in insecure contexts and older browsers.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text)
      return
    } catch (reason) {
      if (copyWithTextarea(text)) return
      throw reason instanceof Error ? reason : new Error('The clipboard refused the text.')
    }
  }
  if (!copyWithTextarea(text)) throw new Error('This browser can’t copy to the clipboard.')
}

/**
 * Copy text to the clipboard from any trigger, with a `copied` state that clears itself and an
 * `error` when the copy fails.
 *
 * @remarks
 * `useClipboard` is what {@link CopyButton | CopyButton} is made of: use it when the trigger is
 * your own, like a menu item or a whole row. It uses the Clipboard API, and falls back to the
 * older `execCommand('copy')` where that's missing (a page served over plain HTTP) or refused, so
 * a copy works wherever it can and says so when it can't.
 *
 * Copying is silent to screen readers. If your trigger doesn't say what happened, announce it,
 * the way `CopyButton` does with a polite live region.
 */
export function useClipboard({
  timeout = 1500,
  onCopy,
  onError,
}: UseClipboardOptions = {}): UseClipboardResult {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const callbacks = useLatest({ onCopy, onError, timeout })

  useEffect(
    () => () => {
      clearTimeout(timer.current)
    },
    [],
  )

  const reset = useCallback(() => {
    clearTimeout(timer.current)
    setCopied(false)
    setError(null)
  }, [])

  const copy = useCallback(
    async (value: string | (() => string)) => {
      clearTimeout(timer.current)
      const { onCopy: done, onError: failed, timeout: wait } = callbacks.current
      let ok: boolean
      try {
        const text = typeof value === 'function' ? value() : value
        await writeClipboard(text)
        setCopied(true)
        setError(null)
        done?.(text)
        ok = true
      } catch (reason) {
        const problem = reason instanceof Error ? reason : new Error(String(reason))
        setCopied(false)
        setError(problem)
        failed?.(problem)
        ok = false
      }
      timer.current = setTimeout(() => {
        setCopied(false)
        setError(null)
      }, wait)
      return ok
    },
    [callbacks],
  )

  return { copy, copied, error, reset }
}
