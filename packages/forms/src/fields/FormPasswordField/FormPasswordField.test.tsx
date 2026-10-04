import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormPasswordField } from '#fields/FormPasswordField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

runFieldConformance<string>('password', {
  build: (props) => <FormPasswordField autoComplete="current-password" {...props} />,
  valid: 'correct-horse-battery-staple',
  invalid: '',
  interact: async (user, control, value) => {
    await user.clear(control)
    if (value) await user.type(control, value)
  },
  // View mode masks the password: never show its text or leak its length.
  viewText: '••••••••',
  // The show/hide toggle sits inside the same control, after the input (PasswordInput's own
  // blur only fires once focus leaves "the input *and* its toggle"), so one Tab off the input
  // only reaches the toggle — a second Tab is what actually leaves the control.
  leaveControl: async (user) => {
    await user.tab()
    await user.tab()
  },
})

// These bind through the canonical `form.AppField` path — the same binding the typed
// `f.PasswordField` shorthand uses.
describe('FormPasswordField', () => {
  it('binds through the canonical field path and writes strings', async () => {
    const { form, user } = renderForm(
      (f) => (
        <f.AppField name="password">
          {() => <FormPasswordField label="Password" autoComplete="current-password" />}
        </f.AppField>
      ),
      { defaultValues: { password: '' } },
    )
    await user.type(screen.getByLabelText('Password'), 'sesame-street')
    expect(form.state.values.password).toBe('sesame-street')
  })

  it('shows nothing in view mode for an empty password', () => {
    renderForm(
      (f) => (
        <f.AppField name="password">
          {() => <FormPasswordField label="Password" autoComplete="current-password" />}
        </f.AppField>
      ),
      { defaultValues: { password: '' }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })
})
