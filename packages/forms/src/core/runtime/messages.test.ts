import { describe, expect, it } from 'vitest'
import { defaultMessages, interpolate, mergeMessages, resolveMessage } from '#core/runtime/messages'

describe('messages', () => {
  it('interpolates {placeholders}, leaving unknown ones', () => {
    expect(interpolate('Enter at least {value} characters', { value: 3 })).toBe(
      'Enter at least 3 characters',
    )
    expect(interpolate('Hello {name}', {})).toBe('Hello {name}')
  })

  it('resolves $keys against the dictionary', () => {
    expect(resolveMessage('$rules.minLength', defaultMessages, { value: 8 })).toBe(
      'Enter at least 8 characters',
    )
    expect(resolveMessage('$rules.nope', defaultMessages)).toBe('$rules.nope')
    expect(resolveMessage('Plain {value}', defaultMessages, { value: 1 })).toBe('Plain 1')
  })

  it('merges overrides one level deep for rules', () => {
    const merged = mergeMessages(
      { rules: { required: 'Required' } as typeof defaultMessages.rules },
      { saved: 'All saved' },
    )
    expect(merged.rules.required).toBe('Required')
    expect(merged.rules.email).toBe(defaultMessages.rules.email)
    expect(merged.saved).toBe('All saved')
  })

  it('has real copy for the plural forms', () => {
    expect(defaultMessages.errorCount(1)).toBe('1 error')
    expect(defaultMessages.errorCount(3)).toBe('3 errors')
    expect(defaultMessages.stepOf(2, 4, 'Picks')).toBe('Step 2 of 4: Picks')
    expect(defaultMessages.stepCompact(2, 4)).toBe('Step 2 of 4')
  })

  it('has layout copy for the repeater, review and stepper', () => {
    expect(defaultMessages.actions).toBe('Actions')
    expect(defaultMessages.edit).toBe('Edit')
    expect(defaultMessages.stepComplete).toBe('completed')
    expect(defaultMessages.stepError).toBe('has errors')
    expect(
      mergeMessages({
        stepCompact: (index, count) => `${String(index)}/${String(count)}`,
      }).stepCompact(1, 3),
    ).toBe('1/3')
  })
})
