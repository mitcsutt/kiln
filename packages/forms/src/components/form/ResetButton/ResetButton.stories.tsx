import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, ResetButton, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { kit } from '#kit/defaultKit'

const meta = {
  title: 'Forms/Layouts/ResetButton',
  component: ResetButton,
} satisfies Meta<typeof ResetButton>

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
      <Inline gap={3}>
        <ResetButton>Reset</ResetButton>
        <SubmitButton>Save</SubmitButton>
      </Inline>
    </Form>
  )
}

export const Playground: Story = {
  render: () => <Basic />,
}

/**
 * `to="baseline"` (the default) undoes edits back to the last save; `to="defaults"` goes all the
 * way back to the form's original defaults, even past a save.
 */
function ToDefaultsVsBaseline() {
  const form = kit.useAppForm({
    defaultValues: { name: 'Ada Lovelace' },
    onSubmit: () => undefined,
  })
  return (
    <Form form={form} aria-label="Account">
      <form.TextField name="name" label="Full name" autoComplete="name" required />
      <Text size="sm" tone="muted">
        Edit the name, save, then edit it again — "Undo edit" returns to the saved value; "Start
        over" returns to "Ada Lovelace" either way.
      </Text>
      <Inline gap={3}>
        <ResetButton to="baseline">Undo edit</ResetButton>
        <ResetButton to="defaults">Start over</ResetButton>
        <SubmitButton>Save</SubmitButton>
      </Inline>
    </Form>
  )
}

export const ToDefaultsVsBaselineStory: Story = {
  name: 'To defaults vs. baseline',
  render: () => <ToDefaultsVsBaseline />,
}

/**
 * `to="baseline"` resets to the last saved values (after a rebaselining submit or an autosave)
 * rather than the original defaults.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { from: 'Harbour Square', to: 'Kelso Bay Pier' } })
    return (
      <Form form={form} aria-label="Plan a trip">
        <Stack gap={5}>
          <form.TextField name="from" label="From" />
          <form.TextField name="to" label="To" />
          <Inline gap={3}>
            <SubmitButton>Find sailings</SubmitButton>
            <ResetButton>Start again</ResetButton>
          </Inline>
        </Stack>
      </Form>
    )
  },
}
