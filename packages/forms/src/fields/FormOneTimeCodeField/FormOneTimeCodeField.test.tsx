import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SubmitButton } from '#components/SubmitButton'
import { FormOneTimeCodeField } from '#fields/FormOneTimeCodeField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

// length: 1 — a single cell is both the first and only focusable descendant of the group, so
// it behaves like any other single-control field for the generic conformance checks (one Tab
// leaves the whole group; `focusTarget` lands on the same cell an invalid submit focuses).
runFieldConformance<string>('oneTimeCode', {
  build: (props) => <FormOneTimeCodeField length={1} {...props} />,
  valid: '7',
  invalid: '',
  // The group (aria-labelledby) and its one cell (native `for`/id — "clicking the label focuses
  // the first cell") are both labelled "Conformance subject", so `getByLabelText` is ambiguous;
  // go straight to the cell by role instead.
  control: () => must(screen.getAllByRole('textbox')[0]),
  interact: async (user, control, value) => {
    await user.clear(control)
    if (value) await user.type(control, value)
  },
  // `aria-describedby` for the error is wired to the group (`OTP.Root`), not to an individual
  // cell, so the `blur` check reads it off the group instead of `control()` (a cell).
  describedByTarget: (container) => within(container).getByRole('group'),
})

// These bind through the canonical `form.AppField` path — the same binding the typed
// `f.OneTimeCodeField` shorthand uses.
describe('FormOneTimeCodeField', () => {
  it('binds through the canonical field path', async () => {
    const { form, user } = renderForm(
      (f) => (
        <f.AppField name="code">
          {() => <FormOneTimeCodeField label="Verification code" length={4} />}
        </f.AppField>
      ),
      { defaultValues: { code: '' } },
    )
    await user.click(must(screen.getAllByRole('textbox')[0]))
    await user.keyboard('2468')
    expect(form.state.values.code).toBe('2468')
  })

  it('submits the form once every cell is filled, when submitOnComplete is set', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <>
          <f.AppField name="code">
            {() => <FormOneTimeCodeField label="Verification code" length={4} submitOnComplete />}
          </f.AppField>
          <SubmitButton>Verify</SubmitButton>
        </>
      ),
      { defaultValues: { code: '' }, onSubmit },
    )
    await user.click(must(screen.getAllByRole('textbox')[0]))
    await user.keyboard('1234')
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('does not submit on completion without submitOnComplete', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <>
          <f.AppField name="code">
            {() => <FormOneTimeCodeField label="Verification code" length={4} />}
          </f.AppField>
          <SubmitButton>Verify</SubmitButton>
        </>
      ),
      { defaultValues: { code: '' }, onSubmit },
    )
    await user.click(must(screen.getAllByRole('textbox')[0]))
    await user.keyboard('1234')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders the code in view mode', () => {
    renderForm(
      (f) => (
        <f.AppField name="code">
          {() => <FormOneTimeCodeField label="Verification code" length={4} />}
        </f.AppField>
      ),
      { defaultValues: { code: '1234' }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('1234')).toBeInTheDocument()
  })
})
