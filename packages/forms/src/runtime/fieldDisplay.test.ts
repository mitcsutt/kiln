import { fieldDisplay, type FieldDisplayInput } from '#runtime/fieldDisplay'
import { createFormRuntime, type FormRuntime } from '#runtime/formRuntime'
import type { ErrorVisibility } from '#runtime/visibility'

function runtimeWith(errorVisibility: ErrorVisibility = 'blur'): FormRuntime {
  const runtime = createFormRuntime()
  runtime.options = { ...runtime.options, errorVisibility }
  return runtime
}

const pristine = { isTouched: false, isBlurred: false, isDirty: false }
const blurred = { isTouched: true, isBlurred: true, isDirty: true }

function input(overrides: Partial<FieldDisplayInput> = {}): FieldDisplayInput {
  return {
    mode: 'edit',
    inactive: false,
    meta: { ...blurred, errorMap: { onDynamic: 'Enter a town' } },
    submitted: false,
    revealed: false,
    quiet: false,
    warning: undefined,
    ...overrides,
  }
}

describe('fieldDisplay', () => {
  it('shows the first error once the policy makes it visible', () => {
    expect(fieldDisplay(runtimeWith(), input())).toEqual({
      showError: true,
      error: 'Enter a town',
      warning: undefined,
      errorLive: true,
    })
  })

  it('hides an error the policy does not show yet', () => {
    const display = fieldDisplay(
      runtimeWith(),
      input({ meta: { ...pristine, errorMap: { onDynamic: 'Enter a town' } } }),
    )
    expect(display.showError).toBe(false)
    expect(display.error).toBeUndefined()
  })

  it('picks by slot priority: a server error beats a change error', () => {
    const display = fieldDisplay(
      runtimeWith(),
      input({ meta: { ...blurred, errorMap: { onChange: 'Too short', onServer: 'Taken' } } }),
    )
    expect(display.error).toBe('Taken')
  })

  it("formats through the runtime's messages and formatError", () => {
    const runtime = runtimeWith()
    runtime.options = { ...runtime.options, formatError: (error) => `! ${error.message}` }
    expect(fieldDisplay(runtime, input()).error).toBe('! Enter a town')
  })

  it('an error with no text shows as invalid with an empty message', () => {
    const display = fieldDisplay(
      runtimeWith(),
      input({ meta: { ...blurred, errorMap: { onBlur: true } } }),
    )
    expect(display).toMatchObject({ showError: true, error: '' })
  })

  it.each([
    ['view mode', { mode: 'view' as const }],
    ['an inactive field', { inactive: true }],
  ])('never shows an error in %s', (_, overrides) => {
    const display = fieldDisplay(runtimeWith(), input(overrides))
    expect(display.showError).toBe(false)
    expect(display.error).toBeUndefined()
  })

  it("under 'submit', an error shows after a submit attempt or a reveal, not on blur", () => {
    const runtime = runtimeWith('submit')
    expect(fieldDisplay(runtime, input()).showError).toBe(false)
    expect(fieldDisplay(runtime, input({ submitted: true })).showError).toBe(true)
    expect(fieldDisplay(runtime, input({ revealed: true })).showError).toBe(true)
  })

  it('a custom policy gets the meta and whether the form was submitted', () => {
    const policy = vi.fn(({ submitted }: { submitted: boolean }) => submitted)
    const runtime = runtimeWith(policy)
    expect(fieldDisplay(runtime, input()).showError).toBe(false)
    expect(fieldDisplay(runtime, input({ submitted: true })).showError).toBe(true)
    expect(policy).toHaveBeenLastCalledWith({
      meta: expect.objectContaining({ isBlurred: true }) as unknown,
      submitted: true,
    })
  })

  it('announces errors live, except after a submit or a quiet reveal', () => {
    const runtime = runtimeWith()
    expect(fieldDisplay(runtime, input()).errorLive).toBe(true)
    expect(fieldDisplay(runtime, input({ submitted: true })).errorLive).toBe(false)
    expect(fieldDisplay(runtime, input({ revealed: true, quiet: true })).errorLive).toBe(false)
    expect(fieldDisplay(runtime, input({ revealed: true })).errorLive).toBe(true)
  })

  describe('warnings', () => {
    const advice = () => 'Most people use a postcode here'
    const valid = { ...blurred, errorMap: {} }

    it('show under the same visibility rule as errors, while no error shows', () => {
      const runtime = runtimeWith()
      expect(fieldDisplay(runtime, input({ meta: valid, warning: advice })).warning).toBe(
        'Most people use a postcode here',
      )
      expect(
        fieldDisplay(runtime, input({ meta: { ...pristine, errorMap: {} }, warning: advice }))
          .warning,
      ).toBeUndefined()
    })

    it('give way to an error', () => {
      expect(fieldDisplay(runtimeWith(), input({ warning: advice })).warning).toBeUndefined()
    })

    it('are not computed in view mode or when not visible', () => {
      const warning = vi.fn(advice)
      fieldDisplay(runtimeWith(), input({ mode: 'view', meta: valid, warning }))
      fieldDisplay(runtimeWith(), input({ meta: { ...pristine, errorMap: {} }, warning }))
      expect(warning).not.toHaveBeenCalled()
    })

    it.each([[''], [null], [undefined]])('treat %j as no warning', (empty) => {
      expect(
        fieldDisplay(runtimeWith(), input({ meta: valid, warning: () => empty })).warning,
      ).toBe(undefined)
    })
  })
})
