import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack, Inline, Text } from '@mitcsutt/kiln-ui'
import { kit } from '#kit/defaultKit'

const meta = {
  title: 'Forms/Layouts/SubmitButton',
  component: SubmitButton,
} satisfies Meta<typeof SubmitButton>

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
 * `requireChanges`: stays `aria-disabled` (never the real `disabled` attribute, so it keeps its
 * accessible name and focus order) with a spoken reason, until the form is actually dirty.
 */
function RequireChanges() {
  const form = kit.useAppForm({
    defaultValues: { name: 'Ada Lovelace' },
    onSubmit: () => undefined,
  })
  return (
    <Form form={form} aria-label="Account">
      <form.TextField name="name" label="Full name" autoComplete="name" required />
      <Text size="sm" tone="muted">
        The button starts aria-disabled — try editing the name.
      </Text>
      <SubmitButton requireChanges>Save changes</SubmitButton>
    </Form>
  )
}

export const RequireChangesStory: Story = {
  name: 'Require changes',
  render: () => <RequireChanges />,
}

/**
 * While locked (`disabled` on `<Form>`, or a submit already in flight), the button is
 * `aria-disabled` and ignores clicks — it never takes on the native `disabled` attribute.
 */
function Locked() {
  const form = kit.useAppForm({ defaultValues: { name: 'Ada Lovelace' } })
  return (
    <Form form={form} aria-label="Account" disabled>
      <form.TextField name="name" label="Full name" autoComplete="name" />
      <Inline gap={3}>
        <SubmitButton>Save</SubmitButton>
      </Inline>
    </Form>
  )
}

export const LockedStory: Story = {
  name: 'Locked',
  render: () => <Locked />,
}

/**
 * Outside the `<form>` element (in a dialog footer, a sticky header), pass `formId` to submit a
 * form by its id, and `form` to read its state. `submitMeta` passes a value through to `onSubmit`
 * as `meta`, for a form with two submit buttons ("Save draft" and "Publish").
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: { nickname: 'Morning commute' },
      onSubmit: () => new Promise((resolve) => setTimeout(resolve, 1200)),
    })
    return (
      <Form form={form} aria-label="Route nickname">
        <Stack gap={5}>
          <form.TextField name="nickname" label="Nickname" />
          {/* Change the name to enable it. It stays focusable while it waits. */}
          <SubmitButton requireChanges>Save nickname</SubmitButton>
        </Stack>
      </Form>
    )
  },
}
