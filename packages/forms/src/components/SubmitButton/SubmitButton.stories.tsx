import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline, Text } from '@mitcsutt/kiln-ui'
import { Form } from '#components/Form'
import { kit } from '#kit'
import { SubmitButton } from './SubmitButton'

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
