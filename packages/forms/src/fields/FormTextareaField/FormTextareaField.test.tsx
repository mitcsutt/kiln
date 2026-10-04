import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormTextareaField } from '#fields/FormTextareaField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

runFieldConformance<string>('textarea', {
  build: (props) => <FormTextareaField {...props} rows={3} />,
  valid: 'Arriving on the late train.',
  invalid: '',
  interact: async (user, control, value) => {
    await user.clear(control)
    if (value) await user.type(control, value)
  },
})

describe('FormTextareaField', () => {
  it('keeps a character count while bound', async () => {
    const { user } = renderForm(
      (f) => <f.TextareaField name="notes" label="Notes" maxLength={40} showCount />,
      {
        defaultValues: { notes: '' },
      },
    )
    await user.type(screen.getByLabelText('Notes'), 'Gate 4')
    expect(screen.getByText('6 / 40')).toBeInTheDocument()
  })
})
