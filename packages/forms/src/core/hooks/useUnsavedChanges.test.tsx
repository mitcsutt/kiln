import { useEffect } from 'react'
import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useUnsavedChanges } from '#core/hooks/useUnsavedChanges'
import { kit } from '#kit'

let api: ReturnType<typeof kit.useAppForm<{ name: string }>> | null = null
function Guarded() {
  const form = kit.useAppForm({ defaultValues: { name: '' } })
  useEffect(() => {
    api = form
  })
  useUnsavedChanges(form)
  return null
}

describe('useUnsavedChanges', () => {
  it('prompts on beforeunload only while dirty', () => {
    render(<Guarded />)
    const clean = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(clean)
    expect(clean.defaultPrevented).toBe(false)
    act(() => api?.setFieldValue('name', 'Ada'))
    const dirty = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(dirty)
    expect(dirty.defaultPrevented).toBe(true)
  })
})
