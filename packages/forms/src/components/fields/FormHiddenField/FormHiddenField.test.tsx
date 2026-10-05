import { act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormHiddenField } from '#components/fields/FormHiddenField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

runFieldConformance<string>('hidden', {
  build: () => <FormHiddenField />,
  valid: 'csrf-7f3a',
  invalid: '',
  interact: () => undefined,
  control: (container) => must(container.querySelector<HTMLInputElement>('input[type="hidden"]')),
  // A hidden input has no label, focus, view or warning; reset is covered below.
  skip: ['label', 'blur', 'submit', 'focus', 'reset', 'interactivity', 'view', 'warning'],
})

describe('FormHiddenField', () => {
  it('mirrors the value and follows reset', () => {
    const { container, form } = renderForm((f) => <f.HiddenField name="token" />, {
      defaultValues: { token: 'a1' },
    })
    const input = must(container.querySelector<HTMLInputElement>('input[type="hidden"]'))
    expect(input.value).toBe('a1')
    act(() => {
      form.setFieldValue('token', 'b2')
    })
    expect(input.value).toBe('b2')
    act(() => {
      form.reset()
    })
    expect(input.value).toBe('a1')
  })
})
