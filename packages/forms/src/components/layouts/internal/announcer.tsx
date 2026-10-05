import { useCallback, useState, type ReactNode } from 'react'
import { VisuallyHidden } from '@mitcsutt/kiln-ui'

/**
 * One polite live region per layout (§11.4): repeater and step changes. Each message is a new
 * node, so repeating the same text is announced again.
 */
export function useAnnouncer(): [ReactNode, (message: string) => void] {
  const [message, setMessage] = useState<{ id: number; text: string }>({ id: 0, text: '' })
  const announce = useCallback((text: string) => {
    setMessage((previous) => ({ id: previous.id + 1, text }))
  }, [])
  const region = (
    <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
      {message.text === '' ? null : <span key={message.id}>{message.text}</span>}
    </VisuallyHidden>
  )
  return [region, announce]
}
