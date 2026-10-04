import { useState, type ReactNode } from 'react'
import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { Button } from '@mitcsutt/kiln-ui'
import { renderForm } from '#test/renderForm'
import { When } from '#layouts/When'
import { FormReview } from '#layouts/FormReview'
import { getFormRuntime } from '#core/runtime/formRuntime'
import { FormSteps } from './FormSteps'
import { useFormSteps } from './useFormSteps'

const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

interface Entry {
  name: string
  email: string
  company: string
  hasCompany: boolean
  notes: string
}
const defaults: Entry = { name: '', email: '', company: '', hasCompany: false, notes: '' }

function stepper() {
  return screen.getByRole('list', { name: 'Sign-up steps' })
}

describe('FormSteps', () => {
  it('renders a Stepper ol with aria-current on the current step; other steps are mounted but hidden', () => {
    renderForm(
      (f) => (
        <FormSteps label="Sign-up steps">
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" />
          </FormSteps.Step>
          <FormSteps.Step value="contact" title="Contact" description="How we reach you.">
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
        </FormSteps>
      ),
      { defaultValues: defaults },
    )
    const list = stepper()
    expect(list.tagName).toBe('OL')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(list).getByRole('button', { name: /You/ })).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(screen.getByRole('region', { name: 'You' })).not.toHaveAttribute('hidden')
    expect(screen.getByLabelText('Email').closest('section')).toHaveAttribute('hidden')
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('the current step with errors keeps aria-current and reads "has errors"; status copy comes from messages', async () => {
    const { user } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps">
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
          </FormSteps.Step>
          <FormSteps.Step value="contact" title="Contact">
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
        </FormSteps>
      ),
      { defaultValues: defaults, messages: { stepError: 'needs attention', stepComplete: 'done' } },
    )
    await user.click(screen.getByRole('button', { name: 'Next' }))
    const current = await within(stepper()).findByRole('button', { name: 'You needs attention' })
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(current).toHaveAttribute('data-invalid', 'true')
    await user.type(screen.getByLabelText('Full name'), 'Ada')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(await within(stepper()).findByRole('button', { name: 'You done' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(within(stepper()).getByRole('button', { name: /Contact/ })).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('compactBelow: the one-line summary uses messages.stepCompact and the step title', () => {
    renderForm(
      (f) => (
        <FormSteps label="Sign-up steps" compactBelow="md">
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" />
          </FormSteps.Step>
          <FormSteps.Step value="contact" title="Contact">
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
        </FormSteps>
      ),
      {
        defaultValues: defaults,
        messages: { stepCompact: (index, count) => `Stage ${String(index)} of ${String(count)}` },
      },
    )
    expect(screen.getByText('Stage 1 of 2 · You', { selector: 'p' })).toBeInTheDocument()
  })

  it('Next blocks on an invalid step, shows its errors and focuses the first invalid field', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps">
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
          </FormSteps.Step>
          <FormSteps.Step value="contact" title="Contact">
            <f.TextField name="email" label="Email" validators={{ onDynamic: required }} />
          </FormSteps.Step>
        </FormSteps>
      ),
      { defaultValues: defaults, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveFocus())
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Enter a value')).toBeInTheDocument()
    // The later step's errors are not shown yet.
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('region', { name: 'You' })).not.toHaveAttribute('hidden')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('advances when valid: focuses the new heading and announces "Step n of m"; Back keeps values', async () => {
    const { user, form } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps">
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
          </FormSteps.Step>
          <FormSteps.Step value="contact" title="Contact details">
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
          <FormSteps.Step value="notes" title="Notes">
            <f.TextField name="notes" label="Notes" />
          </FormSteps.Step>
        </FormSteps>
      ),
      { defaultValues: defaults },
    )
    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    const heading = screen.getByRole('heading', { name: 'Contact details' })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 3: Contact details')
    expect(within(stepper()).getByRole('button', { name: /You/ })).not.toHaveAttribute(
      'aria-current',
    )
    expect(within(stepper()).getByRole('button', { name: /Contact details/ })).toHaveAttribute(
      'aria-current',
      'step',
    )

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'You' })).toHaveFocus())
    expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace')
    expect(form.state.values.email).toBe('ada@example.com')
  })

  it('the last step submits; a skipped-ahead error reveals its step and focuses the field', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps" linear={false}>
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
          </FormSteps.Step>
          <FormSteps.Step value="contact" title="Contact">
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
        </FormSteps>
      ),
      { defaultValues: defaults, onSubmit },
    )
    await user.click(within(stepper()).getByRole('button', { name: /Contact/ }))
    expect(await screen.findByRole('button', { name: 'Submit' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveFocus())
    expect(screen.getByRole('region', { name: 'You' })).not.toHaveAttribute('hidden')
    expect(onSubmit).not.toHaveBeenCalled()
    // The revealed step keeps aria-current; once you leave it, the indicator marks its errors.
    expect(within(stepper()).getByRole('button', { name: /You/ })).toHaveAttribute(
      'aria-current',
      'step',
    )
    await user.click(within(stepper()).getByRole('button', { name: /Contact/ }))
    expect(
      await within(stepper()).findByRole('button', { name: /You.*has errors/ }),
    ).toBeInTheDocument()
    await user.click(within(stepper()).getByRole('button', { name: /You/ }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'You' })).toHaveFocus())

    await user.type(screen.getByLabelText('Full name'), 'Ada')
    await user.click(within(stepper()).getByRole('button', { name: /Contact/ }))
    await user.click(await screen.findByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('linear: jumping ahead from the Stepper validates the steps in between', async () => {
    const { user } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps">
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
          </FormSteps.Step>
          <FormSteps.Step value="contact" title="Contact">
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
        </FormSteps>
      ),
      { defaultValues: defaults },
    )
    await user.click(within(stepper()).getByRole('button', { name: /Contact/ }))
    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveFocus())
    expect(screen.getByLabelText('Email').closest('section')).toHaveAttribute('hidden')
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports a controlled step (deep-linkable)', async () => {
    const seen: string[] = []
    function Host({
      children,
    }: {
      children: (step: string, set: (s: string) => void) => ReactNode
    }) {
      const [step, setStep] = useState('contact')
      return <>{children(step, setStep)}</>
    }
    const { user } = renderForm(
      (f) => (
        <Host>
          {(step, setStep) => (
            <FormSteps
              label="Sign-up steps"
              value={step}
              onValueChange={(next) => {
                seen.push(next)
                setStep(next)
              }}
            >
              <FormSteps.Step value="you" title="You">
                <f.TextField name="name" label="Full name" />
              </FormSteps.Step>
              <FormSteps.Step value="contact" title="Contact">
                <f.TextField name="email" label="Email" />
              </FormSteps.Step>
            </FormSteps>
          )}
        </Host>
      ),
      { defaultValues: defaults },
    )
    expect(screen.getByRole('region', { name: 'Contact' })).not.toHaveAttribute('hidden')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(seen).toEqual(['you'])
    expect(screen.getByRole('region', { name: 'You' })).not.toHaveAttribute('hidden')
  })

  it('a step wrapped in When drops out of the sequence (and its fields are pruned)', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps">
          <FormSteps.Step value="you" title="You">
            <f.CheckboxField name="hasCompany" label="I work for a company" />
          </FormSteps.Step>
          <When form={f} is={(v) => v.hasCompany}>
            <FormSteps.Step value="company" title="Company">
              <f.TextField name="company" label="Company name" />
            </FormSteps.Step>
          </When>
          <FormSteps.Step value="notes" title="Notes">
            <f.TextField name="notes" label="Notes" />
          </FormSteps.Step>
        </FormSteps>
      ),
      {
        defaultValues: defaults,
        onSubmit: ({ value }) => {
          onSubmit(value)
        },
      },
    )
    expect(within(stepper()).getAllByRole('listitem')).toHaveLength(2)
    await user.click(screen.getByLabelText('I work for a company'))
    expect(
      within(stepper())
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      expect.stringContaining('You'),
      expect.stringContaining('Company'),
      expect.stringContaining('Notes'),
    ])
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.type(await screen.findByLabelText('Company name'), 'Brightline Labs')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByLabelText('I work for a company'))
    expect(within(stepper()).getAllByRole('listitem')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(await screen.findByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ hasCompany: false, company: '' })
  })

  it('per-step schema issues are filtered to the step and block Next', async () => {
    const stepSchema = z.object({
      email: z.email('Enter an email address'),
      name: z.string().min(50),
    })
    const { user } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps">
          <FormSteps.Step value="contact" title="Contact" schema={stepSchema}>
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" />
          </FormSteps.Step>
        </FormSteps>
      ),
      { defaultValues: defaults },
    )
    await user.type(screen.getByLabelText('Email'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByLabelText('Email')).toHaveFocus())
    expect(screen.getByText('Enter an email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).not.toHaveAttribute('aria-invalid', 'true')

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'You' })).toHaveFocus())
  })

  it('Enter in a text input on a non-final step means Next', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps">
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" />
          </FormSteps.Step>
          <FormSteps.Step value="contact" title="Contact">
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
        </FormSteps>
      ),
      { defaultValues: defaults, onSubmit },
    )
    await user.type(screen.getByLabelText('Full name'), 'Ada{Enter}')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Contact' })).toHaveFocus())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('useFormSteps drives custom chrome with nav="none"', async () => {
    function Chrome() {
      const steps = useFormSteps()
      return (
        <p>
          {`${String(steps.index + 1)}/${String(steps.count)} ${steps.current}`}
          <Button onClick={() => void steps.next()}>Continue</Button>
        </p>
      )
    }
    const { user } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps" nav="none">
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" />
          </FormSteps.Step>
          <FormSteps.Step value="contact" title="Contact">
            <f.TextField name="email" label="Email" />
          </FormSteps.Step>
          <Chrome />
        </FormSteps>
      ),
      { defaultValues: defaults },
    )
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull()
    expect(screen.getByText('1/2 you')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByText('2/2 contact')).toBeInTheDocument()
  })

  it('a review step repeating earlier fields: invalid submit focuses the real field in its step; the review step never absorbs errors', async () => {
    const onSubmit = vi.fn()
    let statuses: readonly string[] = []
    function Statuses() {
      statuses = useFormSteps().steps.map((step) => `${step.value}:${step.status}`)
      return null
    }
    const { user, form } = renderForm(
      (f) => (
        <FormSteps label="Sign-up steps" linear={false}>
          <FormSteps.Step value="you" title="You">
            <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
          </FormSteps.Step>
          <When form={f} is={(v) => !v.hasCompany}>
            <FormSteps.Step value="review" title="Review">
              <FormReview title="Check your answers">
                <f.TextField name="name" label="Full name" />
              </FormReview>
            </FormSteps.Step>
          </When>
          <Statuses />
        </FormSteps>
      ),
      { defaultValues: defaults, onSubmit },
    )
    const runtime = getFormRuntime(form)
    const realInput = () => document.querySelector('input[name="name"]')
    // the review copy creates no TanStack field: the instance is the real field's (with its validators)
    const instance = (
      form as unknown as {
        fieldInfo: Record<string, { instance: { options: { validators?: object } } | null }>
      }
    ).fieldInfo.name?.instance
    expect(instance?.options.validators).toHaveProperty('onDynamic')
    expect(realInput()).not.toBeNull()
    await user.click(within(stepper()).getByRole('button', { name: /Review/ }))
    await user.click(await screen.findByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveFocus())
    expect(screen.getByRole('region', { name: 'You' })).not.toHaveAttribute('hidden')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(statuses).toContain('review:upcoming')
    expect(statuses).toContain('you:error')
    expect(runtime.fields.get('name')?.element()).toBe(realInput())
    // Unmounting the review keeps the real field registered.
    act(() => {
      form.setFieldValue('hasCompany', true)
    })
    expect(screen.queryByRole('region', { name: 'Review' })).toBeNull()
    expect(runtime.fields.get('name')?.element()).toBe(realInput())
    // …and its meta (TanStack's field instance is still the real one: errors survive)
    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  for (const errorVisibility of ['blur', 'change', 'submit', () => false] as const) {
    it(`Next never blocks on an invisible error (errorVisibility: ${typeof errorVisibility === 'function' ? 'function' : errorVisibility})`, async () => {
      let statuses: readonly string[] = []
      function Statuses() {
        statuses = useFormSteps().steps.map((step) => `${step.value}:${step.status}`)
        return null
      }
      const { user } = renderForm(
        (f) => (
          <FormSteps label="Sign-up steps">
            <FormSteps.Step value="you" title="You">
              <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
            </FormSteps.Step>
            <FormSteps.Step value="contact" title="Contact">
              <f.TextField name="email" label="Email" validators={{ onDynamic: required }} />
            </FormSteps.Step>
            <Statuses />
          </FormSteps>
        ),
        { defaultValues: defaults, errorVisibility },
      )
      await user.click(screen.getByRole('button', { name: 'Next' }))
      const input = screen.getByLabelText('Full name')
      await waitFor(() => expect(input).toHaveFocus())
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAccessibleDescription(/Enter a value/)
      // the later step stays quiet
      expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid', 'true')
      // the step's count (useScopeErrors) sees the revealed errors under every policy
      expect(statuses).toEqual(['you:error', 'contact:upcoming'])
    })
  }
})
