import { describe, expect, it } from 'vitest'
import { createFormRuntime } from '#core/runtime/formRuntime'
import { prune } from '#core/runtime/submit'

describe('prune', () => {
  it('replaces pruned inactive paths with their defaults and keeps the rest', () => {
    const runtime = createFormRuntime()
    runtime.inactive.set('company', { reason: 'hidden', submit: 'prune' })
    runtime.inactive.set('notes', { reason: 'readOnly', submit: 'keep' })
    const values = { name: 'Ada', company: 'Analytical Engines', notes: 'Fast' }
    const defaults = { name: '', company: '', notes: '' }
    expect(prune(values, runtime, defaults)).toEqual({ name: 'Ada', company: '', notes: 'Fast' })
    expect(values.company).toBe('Analytical Engines')
  })

  it('prefers a field-level default and handles nested/array paths', () => {
    const runtime = createFormRuntime()
    runtime.inactive.set('address.city', { reason: 'excluded', submit: 'prune' })
    runtime.inactive.set('guests[1].name', { reason: 'hidden', submit: 'prune' })
    runtime.fieldDefaults.set('address.city', 'London')
    const values = { address: { city: 'Paris' }, guests: [{ name: 'A' }, { name: 'B' }] }
    const defaults = { address: { city: '' }, guests: [] }
    expect(prune(values, runtime, defaults)).toEqual({
      address: { city: 'London' },
      guests: [{ name: 'A' }, { name: undefined }],
    })
  })
})
