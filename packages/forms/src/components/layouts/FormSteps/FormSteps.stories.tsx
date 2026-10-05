import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormStep, FormSteps, useAppForm, useFormSteps } from '@mitcsutt/kiln-forms'
import { Alert, Button, Inline, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { stepsFixture, stepsSchema } from '#stories/fixtures/disclosure'
import { parityStory } from '#stories/parity'
import { StoryForm, storyRoot } from '#stories/_kit'

const meta = {
  title: 'Forms/Layouts/FormSteps',
  component: FormSteps,
  args: {
    label: 'Sign up',
    linear: true,
    nextLabel: 'Continue',
    backLabel: 'Back',
    submitLabel: 'Create account',
    children: null,
  },
} satisfies Meta<typeof FormSteps>

export default meta
type Story = StoryObj<typeof meta>

/** A two-step sign-up: Continue checks the step first. Try `linear` and the button labels. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm
      label="Sign up"
      defaultValues={{ email: '', displayName: '', jobTitle: '' }}
      hideActions
    >
      {(form) => (
        <FormSteps {...args}>
          <FormStep value="account" title="Account" description="You sign in with this.">
            <form.TextField
              name="email"
              label="Email"
              type="email"
              validators={{
                onDynamic: ({ value }) => (value.trim() === '' ? 'Enter your email' : undefined),
              }}
            />
          </FormStep>
          <FormStep value="profile" title="Profile">
            <form.TextField name="displayName" label="Display name" />
            <form.TextField name="jobTitle" label="Job title" />
          </FormStep>
        </FormSteps>
      )}
    </StoryForm>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    await expect(await canvas.findByText('Enter your email')).toBeInTheDocument()
    await expect(canvas.getByLabelText('Display name')).not.toBeVisible()
    await userEvent.type(canvas.getByLabelText(/Email/), 'priya@example.com')
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(canvas.getByLabelText('Display name')).toBeVisible())
  },
}

export const ComponentAndSchema: Story = parityStory(stepsFixture, stepsSchema, [
  'FormSteps',
  'FormSteps.Step',
])

/**
 * - `linear` (on by default) stops the reader skipping ahead past an invalid step.
 * - Control the step with `value` and `onValueChange` to keep it in the URL, so a link can open
 *   the form at a step.
 * - A `FormStep` takes a Standard Schema as `schema` for extra checks on that step only.
 * - Wrap a step in [`When`](/docs/forms/layouts/when) to make it conditional: it leaves the
 *   sequence while hidden, and its values are pruned. See
 *   [Onboarding](/docs/forms/getting-started/onboarding).
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [done, setDone] = useState(false)
    const form = useAppForm({
      defaultValues: { from: '', to: '', date: '', passengers: 1 },
      onSubmit: () => {
        setDone(true)
      },
    })
    if (done)
      return (
        <Alert tone="positive" title="Sailing booked">
          Your tickets are on their way.
        </Alert>
      )
    return (
      <Form form={form} aria-label="Book a sailing">
        <FormSteps label="Booking" headingLevel={3} submitLabel="Book sailing">
          <FormStep value="route" title="Route">
            <form.TextField
              name="from"
              label="From"
              validators={{
                onDynamic: ({ value }) => (value ? undefined : 'Where are you leaving from?'),
              }}
            />
            <form.TextField
              name="to"
              label="To"
              validators={{
                onDynamic: ({ value }) => (value ? undefined : 'Where are you going?'),
              }}
            />
          </FormStep>
          <FormStep value="when" title="When">
            <form.DateField
              name="date"
              label="Date"
              validators={{ onDynamic: ({ value }) => (value ? undefined : 'Choose a date') }}
            />
          </FormStep>
          <FormStep value="who" title="Passengers">
            <form.NumberField name="passengers" label="Passengers" min={1} max={9} stepper />
          </FormStep>
        </FormSteps>
      </Form>
    )
  },
}

function Nav() {
  const steps = useFormSteps()
  return (
    <Inline justify="between">
      <Text size="sm" tone="muted">
        {steps.index + 1} of {steps.count}
      </Text>
      <Inline gap={2}>
        {steps.isFirst ? null : (
          <Button
            variant="ghost"
            tone="neutral"
            onClick={() => {
              steps.back()
            }}
          >
            Back
          </Button>
        )}
        <Button
          type={steps.isLast ? 'submit' : 'button'}
          onClick={steps.isLast ? undefined : () => void steps.next()}
        >
          {steps.isLast ? 'Finish' : 'Next'}
        </Button>
      </Inline>
    </Inline>
  )
}

/**
 * `nav="none"` removes the built-in buttons, and `useFormSteps()` inside the steps gives you the
 * state and the moves: `next()`, `back()`, `goTo(step)`, `index`, `count`, `isFirst`, `isLast`.
 */
export const CustomNav: Story = {
  name: 'Your own navigation',
  tags: ['docs'],
  render: function CustomNav() {
    const form = useAppForm({ defaultValues: { name: '', stop: '' } })
    return (
      <Form form={form} aria-label="Quick setup">
        <FormSteps label="Setup" nav="none" headingLevel={3}>
          <FormStep value="name" title="Your name">
            <form.TextField name="name" label="Name" />
            <Nav />
          </FormStep>
          <FormStep value="stop" title="Home stop">
            <form.TextField name="stop" label="Stop" />
            <Nav />
          </FormStep>
        </FormSteps>
      </Form>
    )
  },
}
