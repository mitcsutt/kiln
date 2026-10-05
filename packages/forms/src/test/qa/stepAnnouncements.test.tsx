/**
 * An invalid Next on a step announces once. A step's Next isn't a submit attempt, so FieldError's
 * `live` (`errorLive`, which is `!submitted`) would otherwise make every revealed error on the step
 * its own `role="alert"` at the same moment. §11.4: inline errors announce on blur; after a
 * (scoped) submit attempt there is one announcement, not one per field. Focus moving to the first
 * invalid field already reads its error via aria-describedby.
 */
import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormSteps } from '#components/layouts/FormSteps'
import { renderForm } from '#test/renderForm'

const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

function setup() {
  return renderForm(
    (f) => (
      <FormSteps label="Sign-up steps">
        <FormSteps.Step value="you" title="You">
          <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
          <f.TextField name="email" label="Email" validators={{ onDynamic: required }} />
          <f.TextField name="phone" label="Phone" validators={{ onDynamic: required }} />
        </FormSteps.Step>
        <FormSteps.Step value="more" title="More">
          <f.TextField name="company" label="Company" />
        </FormSteps.Step>
      </FormSteps>
    ),
    { defaultValues: { name: '', email: '', phone: '', company: '' } },
  )
}

describe('an invalid Next announces once', () => {
  it('Next reveals all three errors and focuses the first field (baseline)', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveFocus())
    expect(screen.getAllByText('Enter a value')).toHaveLength(3)
  })

  it('at most one assertive live region carries the revealed errors', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveFocus())
    const alerts = screen.queryAllByRole('alert').filter((el) => el.textContent !== '')
    expect(alerts.length).toBeLessThanOrEqual(1)
  })
})
