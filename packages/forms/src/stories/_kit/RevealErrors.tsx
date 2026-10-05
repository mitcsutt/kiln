import { useEffect, useRef } from 'react'
import { useFormContext } from '#kit/contexts'

/**
 * Story kit helper: a field's `error`/`warning` only become visible after a blur or a
 * submit attempt (§4.2.3–6) — real state, not a prop a story can just set. Dropped inside a
 * `<Form>`, this submits once on mount (the validators reject it, so nothing really submits) so
 * a "States" story can show the error/warning a field would have after a real attempt, with no
 * scripted interaction needed.
 */
export function RevealErrors(): null {
  const form = useFormContext()
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    void form.handleSubmit()
  }, [form])
  return null
}
