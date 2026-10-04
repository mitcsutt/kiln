import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '@mitcsutt/kiln-ui'
import type { AnyKitForm } from '#core/runtime/formRuntime'
import { SubmitButton } from '#components/SubmitButton'
import { kit } from '#kit'
import { Form } from './Form'

const meta = {
  title: 'Forms/Layouts/Form',
  component: Form,
  // Every story below builds its own live form — this placeholder only satisfies the required
  // `form`/`children` props for Storybook's type, and is never actually rendered.
  args: { form: null as unknown as AnyKitForm, children: null },
} satisfies Meta<typeof Form>

export default meta
type Story = StoryObj<typeof meta>

function Basic() {
  const form = kit.useAppForm({
    defaultValues: { name: 'Ada Lovelace' },
    onSubmit: () => undefined,
  })
  return (
    <Form form={form} aria-label="Account">
      <form.TextField name="name" label="Full name" autoComplete="name" required />
      <SubmitButton>Save</SubmitButton>
    </Form>
  )
}

export const Playground: Story = {
  render: () => <Basic />,
}

/**
 * A `SubmitButton` outside the `<Form>` landmark, wired by the native `formId`: useful when the
 * actions live in a sticky footer or a dialog's own button row, separate from the fields.
 */
function ExternalSubmit() {
  const form = kit.useAppForm({
    defaultValues: { name: 'Ada Lovelace' },
    onSubmit: () => undefined,
  })
  return (
    <>
      <Form form={form} id="account-form" aria-label="Account">
        <form.TextField name="name" label="Full name" autoComplete="name" required />
      </Form>
      <Text size="sm" tone="muted">
        The button below is outside the form element entirely, but still submits it.
      </Text>
      {/* Outside `<Form>` there is no form in context: pass `form` as well as `formId` (§13 #11). */}
      <SubmitButton form={form} formId="account-form">
        Save
      </SubmitButton>
    </>
  )
}

export const ExternalSubmitStory: Story = {
  name: 'External submit',
  render: () => <ExternalSubmit />,
}

/**
 * `mode="view"` cascades to every field through `FieldPresentation`: each renders its display
 * value instead of a control, and the submit/reset buttons make no sense here, so this demo
 * leaves them out.
 */
function ViewModeDemo() {
  const form = kit.useAppForm({
    defaultValues: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      plan: 'yearly',
    },
  })
  return (
    <Form form={form} mode="view" aria-label="Account">
      <form.TextField name="name" label="Full name" />
      <form.TextField name="email" label="Email" type="email" />
      <form.SegmentedField
        name="plan"
        label="Plan"
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />
    </Form>
  )
}

export const ViewMode: Story = {
  render: () => <ViewModeDemo />,
}
