import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createFormRuntime, isInactive } from '#runtime/formRuntime'
import { routeIssues } from '#runtime/standardSchema'

describe('routeIssues', () => {
  it('routes by path and sends path-less issues to the form', () => {
    const routed = routeIssues([
      { message: 'Enter a name', path: ['guests', 0, 'name'] },
      { message: 'Dates overlap' },
      { message: 'Too many', path: ['guests'] },
    ])
    expect(routed).toEqual({
      form: [{ message: 'Dates overlap' }],
      fields: {
        'guests[0].name': [{ message: 'Enter a name', path: ['guests', 0, 'name'] }],
        guests: [{ message: 'Too many', path: ['guests'] }],
      },
    })
  })

  it('drops issues under an inactive prefix', () => {
    const runtime = createFormRuntime()
    runtime.inactive.set('address', { reason: 'hidden', submit: 'prune' })
    expect(isInactive(runtime, 'address.city')).toBe(true)
    const routed = routeIssues(
      [
        { message: 'Enter a city', path: ['address', 'city'] },
        { message: 'Enter a name', path: ['name'] },
      ],
      runtime,
    )
    expect(Object.keys(routed?.fields ?? {})).toEqual(['name'])
  })

  it('returns undefined when nothing is left', () => {
    expect(routeIssues([])).toBeUndefined()
    const runtime = createFormRuntime()
    runtime.inactive.set('a', { reason: 'excluded', submit: 'prune' })
    expect(routeIssues([{ message: 'x', path: ['a'] }], runtime)).toBeUndefined()
  })

  it('routes real zod issues', () => {
    const schema = z.object({
      guests: z.array(z.object({ name: z.string().min(1, 'Enter a name') })),
    })
    const result = schema['~standard'].validate({ guests: [{ name: 'Ada' }, { name: '' }] })
    if (result instanceof Promise) throw new Error('sync expected')
    expect(Object.keys(routeIssues(result.issues)?.fields ?? {})).toEqual(['guests[1].name'])
  })
})
