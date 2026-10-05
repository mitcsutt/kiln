import { describe, expect, it } from 'vitest'
import { normaliseError, normaliseErrors, pickError, pickErrors } from '#runtime/errors'

describe('normaliseError', () => {
  it('handles strings, issues, { message } objects and Errors', () => {
    expect(normaliseError('Enter a name')).toEqual({ message: 'Enter a name' })
    expect(normaliseError({ message: 'Too short', path: ['guests', 0, 'name'] })).toEqual({
      message: 'Too short',
      path: 'guests[0].name',
    })
    expect(
      normaliseError({ message: '$rules.minLength', code: 'minLength', params: { value: 3 } }),
    ).toEqual({
      message: '$rules.minLength',
      code: 'minLength',
      params: { value: 3 },
    })
    expect(normaliseError(new Error('Network down'))).toEqual({ message: 'Network down' })
  })

  it('maps true to an invalid state without text', () => {
    expect(normaliseError(true)).toEqual({ message: '' })
  })

  it('returns null for non-errors', () => {
    for (const value of [undefined, null, false, '', 0, 42, {}, { msg: 'x' }, []]) {
      expect(normaliseError(value)).toBeNull()
    }
  })

  it('never produces [object Object]', () => {
    const issue = { message: 'Enter an email address', path: ['email'] }
    expect(normaliseErrors([issue]).map((e) => e.message)).toEqual(['Enter an email address'])
  })
})

describe('pickErrors', () => {
  it('orders by slot priority onServer > onSubmit > onDynamic > onChange > onBlur > onMount', () => {
    const errorMap = {
      onMount: 'mount',
      onBlur: 'blur',
      onChange: 'change',
      onDynamic: [{ message: 'dynamic' }],
      onSubmit: 'submit',
      onServer: 'server',
    }
    expect(pickErrors(errorMap).map((e) => e.message)).toEqual([
      'server',
      'submit',
      'dynamic',
      'change',
      'blur',
      'mount',
    ])
    expect(pickError({ onBlur: 'blur', onChange: 'change' })?.message).toBe('change')
  })

  it('flattens nested arrays and de-duplicates by message', () => {
    const errorMap = { onDynamic: [[{ message: 'Required' }], 'Required'], onBlur: 'Required' }
    expect(pickErrors(errorMap)).toEqual([{ message: 'Required' }])
  })

  it('returns nothing for an empty map', () => {
    expect(pickError(undefined)).toBeUndefined()
    expect(pickErrors({ onChange: undefined })).toEqual([])
  })
})
