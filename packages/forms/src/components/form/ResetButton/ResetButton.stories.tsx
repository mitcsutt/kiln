import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline, Text } from '@mitcsutt/kiln-ui'
import { Form } from '#components/form/Form'
import { SubmitButton } from '#components/form/SubmitButton'
import { kit } from '#kit/defaultKit'
import { ResetButton } from './ResetButton'

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
