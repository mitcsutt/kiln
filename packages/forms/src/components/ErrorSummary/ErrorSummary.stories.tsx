import type { Meta, StoryObj } from '@storybook/react-vite'
import { RevealErrors } from '#stories/_kit'
import { Form } from '#components/Form'
import { SubmitButton } from '#components/SubmitButton'
import { kit } from '#kit'
import { ErrorSummary } from './ErrorSummary'

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
