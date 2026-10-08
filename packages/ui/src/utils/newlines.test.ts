import { describe, it, expect } from 'vitest'
import { trimTrailingNewlines } from './newlines'

describe('trimTrailingNewlines', () => {
  it('removes every trailing newline', () => {
    expect(trimTrailingNewlines('a\nb\n\n\n')).toBe('a\nb')
  })

  it('keeps inner newlines and other trailing whitespace', () => {
    expect(trimTrailingNewlines('a\n\nb  ')).toBe('a\n\nb  ')
  })

  it('returns an empty string for newlines only', () => {
    expect(trimTrailingNewlines('\n\n')).toBe('')
  })

  it('stays fast on long runs of newlines followed by text', () => {
    const text = `${'\n'.repeat(200_000)}x`
    const start = performance.now()
    expect(trimTrailingNewlines(text)).toBe(text)
    expect(performance.now() - start).toBeLessThan(100)
  })
})
