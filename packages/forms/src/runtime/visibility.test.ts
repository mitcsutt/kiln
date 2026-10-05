import { describe, expect, it } from 'vitest'
import { isErrorVisible } from '#runtime/visibility'

const fresh = { isTouched: false, isBlurred: false, isDirty: false }
const typed = { isTouched: true, isBlurred: false, isDirty: true }
const blurred = { isTouched: true, isBlurred: true, isDirty: true }

describe('isErrorVisible', () => {
  it("'blur' (default): after blur or submit — not on the first keystroke", () => {
    expect(isErrorVisible('blur', fresh, false)).toBe(false)
    expect(isErrorVisible('blur', typed, false)).toBe(false)
    expect(isErrorVisible('blur', blurred, false)).toBe(true)
    expect(isErrorVisible('blur', fresh, true)).toBe(true)
  })

  it("'change': after the first edit or submit", () => {
    expect(isErrorVisible('change', fresh, false)).toBe(false)
    expect(isErrorVisible('change', typed, false)).toBe(true)
    expect(isErrorVisible('change', fresh, true)).toBe(true)
  })

  it("'submit': only after a submit attempt", () => {
    expect(isErrorVisible('submit', blurred, false)).toBe(false)
    expect(isErrorVisible('submit', fresh, true)).toBe(true)
  })

  it('accepts a function', () => {
    expect(isErrorVisible(({ meta }) => meta.isDirty, typed, false)).toBe(true)
    expect(isErrorVisible(({ submitted }) => submitted, blurred, false)).toBe(false)
  })
})
