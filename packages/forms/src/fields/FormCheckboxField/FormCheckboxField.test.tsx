import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormCheckboxField } from '#fields/FormCheckboxField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

runFieldConformance<boolean>('checkbox', {
  build: (props) => <FormCheckboxField {...props} />,
  valid: true,
  invalid: false,
  interact: async (user, control, value) => {
    const checked = control.getAttribute('aria-checked') === 'true'
    if (checked !== value) await user.click(control)
  },
  display: (control) => control.getAttribute('aria-checked') === 'true',
  shown: (value) => value,
  viewText: 'Yes',
})

describe('FormCheckboxField', () => {
  it('writes a boolean', async () => {
    const { form, user } = renderForm(
      (f) => <f.CheckboxField name="agree" label="I've read the house rules" />,
      {
        defaultValues: { agree: false },
      },
    )
    await user.click(screen.getByRole('checkbox', { name: "I've read the house rules" }))
    expect(form.state.values.agree).toBe(true)
  })

  it('renders "No" in view mode when unchecked', () => {
    renderForm((f) => <f.CheckboxField name="agree" label="Newsletter" />, {
      defaultValues: { agree: false },
      formProps: { mode: 'view' },
    })
    expect(screen.getByText('No')).toBeInTheDocument()
  })
})
