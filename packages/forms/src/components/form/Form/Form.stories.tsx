import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, ResetButton, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Grid, Inline, Stack, Text, Toaster, toast } from '@mitcsutt/kiln-ui'
import { useRef, useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import type { AnyKitForm } from '#runtime/formRuntime'
import { kit } from '#kit/defaultKit'

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

/**
 * Give it an accessible name, with `aria-label` or `aria-labelledby`, so assistive technology can
 * list it as a form landmark.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [sent, setSent] = useState('')
    const form = useAppForm({
      defaultValues: { route: 'Morning commute' },
      onSubmit: async ({ value }) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setSent(value.route)
      },
    })
    return (
      <Form form={form} aria-label="Rename route">
        <Stack gap={5}>
          <form.TextField name="route" label="Route name" />
          <Inline gap={3}>
            <SubmitButton>Save name</SubmitButton>
            <ResetButton>Undo changes</ResetButton>
          </Inline>
          {sent ? <Text tone="muted">Saved as {sent}.</Text> : null}
        </Stack>
      </Form>
    )
  },
}

/**
 * A toast suits news about the submit itself once the reader has moved on: "Profile saved", or
 * "Couldn't save" with a Retry. Raise one with kiln-ui's `toast()` at the end of `onSubmit`, and
 * from `onSubmitError` for a throw that isn't a `FormSubmitError`. Mount a `Toaster` once near the
 * root of the app; kiln-forms doesn't need one and never raises a toast itself.
 *
 * Errors the reader can fix belong beside their fields: throw a `FormSubmitError` and they land
 * there, with focus on the first. Don't toast validation errors. An `onSubmitError` of your own
 * replaces the default form-level "Something went wrong" message, so the toast is the only report.
 */
export const ToastOnSubmit: Story = {
  name: 'Toast on submit',
  tags: ['docs'],
  render: function ToastOnSubmit() {
    const attempts = useRef(0)
    const form = useAppForm({
      defaultValues: { displayName: 'Ines Varga' },
      onSubmit: async ({ value }) => {
        await new Promise((resolve) => setTimeout(resolve, 400))
        // Pretend the first save loses its connection.
        attempts.current += 1
        if (attempts.current === 1) throw new Error('Network unreachable')
        toast({
          id: 'profile-save',
          title: 'Profile saved',
          description: `Shown as ${value.displayName}`,
          tone: 'positive',
        })
      },
      onSubmitError: ({ formApi }) => {
        toast({
          id: 'profile-save',
          title: "Couldn't save your profile",
          description: 'Check your connection and try again.',
          tone: 'critical',
          action: {
            label: 'Retry',
            altText: 'Press Save profile again',
            onClick: () => void formApi.handleSubmit(),
          },
        })
      },
    })
    return (
      <Form form={form} aria-label="Profile">
        <Stack gap={5}>
          <form.TextField name="displayName" label="Display name" autoComplete="nickname" />
          <Inline gap={3}>
            <SubmitButton>Save profile</SubmitButton>
          </Inline>
        </Stack>
        <Toaster />
      </Form>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Save profile' }))
    const region = await page.findByRole('region', { name: 'Notifications (F8)' })
    await waitFor(() =>
      expect(within(region).getByText("Couldn't save your profile")).toBeVisible(),
    )
    await userEvent.click(within(region).getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(within(region).getByText('Profile saved')).toBeVisible(), {
      timeout: 4000,
    })
    toast.dismiss()
  },
}

function Example({ state }: { state: 'disabled' | 'readOnly' }) {
  const form = useAppForm({ defaultValues: { name: 'Ines Varga', stop: 'Harbour Square' } })
  return (
    <Form
      form={form}
      aria-label={state}
      disabled={state === 'disabled'}
      readOnly={state === 'readOnly'}
    >
      <form.TextField
        name="name"
        label={state === 'disabled' ? 'Name (disabled)' : 'Name (read-only)'}
      />
      <form.TextField name="stop" label="Home stop" />
    </Form>
  )
}

/**
 * `disabled` and `readOnly` apply to every field inside, and `mode="view"` renders every field as
 * read-only text (see [View mode](/docs/forms/getting-started/view-mode)).
 *
 * They mean different things for the payload. A read-only field can be focused and is submitted,
 * but isn't validated. A disabled field can't be focused and isn't validated either. Neither has
 * errors.
 */
export const States: Story = {
  name: 'Disabled, read-only and view',
  tags: ['docs'],
  render: function States() {
    return (
      <Grid columns={{ base: 1, sm: 2 }} gap={6}>
        <Example state="disabled" />
        <Example state="readOnly" />
      </Grid>
    )
  },
}
