import { Badge, Inline, Stack } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { Form } from '#components/form/Form'
import { ResetButton } from '#components/form/ResetButton'
import { SubmitButton } from '#components/form/SubmitButton'
import { useUnsavedChanges } from '#hooks'
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
