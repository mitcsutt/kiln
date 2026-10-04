import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormSwitchField } from '#fields/FormSwitchField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

runFieldConformance<boolean>('switch', {
  build: (props) => <FormSwitchField {...props} />,
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

// These bind through the canonical `form.AppField` path — the same binding the typed
// `f.SwitchField` shorthand uses.
describe('FormSwitchField', () => {
  it('binds through the canonical field path and writes a boolean', async () => {
    const { form, user } = renderForm(
      (f) => (
        <f.AppField name="notify">
          {() => <FormSwitchField label="Email me when someone replies" />}
        </f.AppField>
      ),
      { defaultValues: { notify: false } },
    )
    await user.click(screen.getByRole('switch', { name: 'Email me when someone replies' }))
    expect(form.state.values.notify).toBe(true)
  })

  it('renders "No" in view mode when off', () => {
    renderForm(
      (f) => <f.AppField name="notify">{() => <FormSwitchField label="Reminders" />}</f.AppField>,
      { defaultValues: { notify: false }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('No')).toBeInTheDocument()
  })
})
