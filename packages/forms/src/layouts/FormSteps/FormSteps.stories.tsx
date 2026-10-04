import type { Meta, StoryObj } from '@storybook/react-vite'
import { stepsFixture, stepsSchema } from '#stories/fixtures/disclosure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormStep, FormSteps } from './FormSteps'

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

/** A two-step sign-up. Try `linear` and the button labels. */
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
}

export const ComponentAndSchema: Story = parityStory(stepsFixture, stepsSchema, [
  'FormSteps',
  'FormSteps.Step',
])
