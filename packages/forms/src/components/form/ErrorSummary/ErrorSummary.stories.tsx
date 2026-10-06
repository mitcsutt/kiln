import type { Meta, StoryObj } from '@storybook/react-vite'
import { ErrorSummary, Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'
import { RevealErrors } from '#stories/_kit'
import { kit } from '#kit/defaultKit'

const meta = {
  title: 'Forms/Layouts/ErrorSummary',
  component: ErrorSummary,
} satisfies Meta<typeof ErrorSummary>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Submits once on mount so the summary is visible without an interaction (`RevealErrors`, the
 * story kit helper) — in a real app this is what a failed submit looks like. Each link moves
 * focus to the field it names, in DOM order.
 */
function Basic() {
  const form = kit.useAppForm({ defaultValues: { name: '', email: '', agree: false } })
  return (
    <Form form={form} aria-label="Sign up">
      <ErrorSummary />
      <form.TextField
        name="name"
        label="Full name"
        autoComplete="name"
        required
        validators={{ onDynamic: () => 'Enter your full name' }}
      />
      <form.TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        validators={{ onDynamic: () => 'Enter an email address' }}
      />
      <form.CheckboxField
        name="agree"
        label="I agree to the terms"
        required
        validators={{ onDynamic: () => 'Accept the terms to continue' }}
      />
      <SubmitButton>Create account</SubmitButton>
      <RevealErrors />
    </Form>
  )
}

export const Playground: Story = {
  render: () => <Basic />,
}

/** A custom title and heading level, for a summary nested under a step or section heading. */
function CustomTitle() {
  const form = kit.useAppForm({ defaultValues: { amount: null as number | null } })
  return (
    <Form form={form} aria-label="Submit an expense">
      <ErrorSummary title="Fix the amount before continuing" headingLevel={3} />
      <form.AmountField
        name="amount"
        label="Amount"
        currency="GBP"
        unit="minor"
        required
        validators={{ onDynamic: () => 'Enter the amount' }}
      />
      <SubmitButton>Submit expense</SubmitButton>
      <RevealErrors />
    </Form>
  )
}

export const CustomTitleStory: Story = {
  name: 'Custom title',
  render: () => <CustomTitle />,
}

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() ? undefined : message),
})

/**
 * Press the button with the fields empty, then follow a link. Put the summary at the top of the
 * form, where a reader returning to it starts. Fields inside still show their own errors.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { name: '', email: '', reference: '' } })
    return (
      <Form form={form} aria-label="Claim a refund">
        <Stack gap={5}>
          <ErrorSummary title="Check these before you claim" />
          <form.TextField name="name" label="Full name" validators={required('Enter your name')} />
          <form.TextField
            name="email"
            label="Email"
            type="email"
            validators={required('Enter your email')}
          />
          <form.TextField
            name="reference"
            label="Booking reference"
            validators={required('Enter the booking reference')}
          />
          <SubmitButton>Claim refund</SubmitButton>
        </Stack>
      </Form>
    )
  },
}
