import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, SubmitButton, useAppForm, useUnsavedChanges } from '@mitcsutt/kiln-forms'
import { Stack, Text, Badge, Inline } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { ResetButton } from '#components/form/ResetButton'
import { FormActions } from '#components/layouts'
import { kit } from '#kit/defaultKit'

const meta = {
  title: 'Forms/Hooks/useUnsavedChanges',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function EditTalk() {
  const form = kit.useAppForm({
    defaultValues: { title: 'Small maps for big cities' },
    onSubmit: () => undefined,
  })
  const unsaved = useUnsavedChanges(form)
  return (
    <Form form={form} aria-label="Edit talk">
      <Stack gap={5}>
        <Inline gap={3}>
          {unsaved ? (
            <Badge tone="caution">Unsaved changes</Badge>
          ) : (
            <Badge variant="outline">Saved</Badge>
          )}
        </Inline>
        <form.TextField name="title" label="Talk title" />
        <FormActions>
          <ResetButton>Discard</ResetButton>
          <SubmitButton>Save talk</SubmitButton>
        </FormActions>
      </Stack>
    </Form>
  )
}

/**
 * Edit the title: the page now asks before you leave it (a `beforeunload` prompt), and the
 * hook's return value drives the badge. Discard the edit and both go away.
 */
export const Playground: Story = {
  render: () => <EditTalk />,
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.type(canvas.getByLabelText('Talk title'), ', revised')
    await expect(canvas.getByText('Unsaved changes')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Discard' }))
    await expect(canvas.getByText('Saved')).toBeInTheDocument()
  },
}

/**
 * Pass `when: false` to switch the guard off, for example while a save is in flight.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: { note: '' },
      onSubmit: () => new Promise((resolve) => setTimeout(resolve, 400)),
    })
    // Warns before the tab closes or reloads while there are unsaved changes.
    const dirty = useUnsavedChanges(form)
    return (
      <Form form={form} aria-label="Feedback">
        <Stack gap={5}>
          <form.TextareaField name="note" label="Feedback for the crew" />
          <Text size="sm" tone="muted">
            {dirty ? 'Unsaved: closing this tab will ask first.' : 'Nothing unsaved.'}
          </Text>
          <SubmitButton>Send</SubmitButton>
        </Stack>
      </Form>
    )
  },
}
