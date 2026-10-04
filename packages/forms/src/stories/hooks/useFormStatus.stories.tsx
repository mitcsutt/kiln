import { DataList, Stack } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { Form } from '#components/Form'
import { SubmitButton } from '#components/SubmitButton'
import { useFormStatus } from '#core/hooks'
import { kit } from '#kit'

const meta = {
  title: 'Forms/Hooks/useFormStatus',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function RenameProject() {
  const form = kit.useAppForm({
    defaultValues: { name: 'Spring catalogue' },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 400)),
  })
  const status = useFormStatus(form)
  return (
    <Stack gap={6}>
      <Form form={form} aria-label="Rename project">
        <Stack gap={5}>
          <form.TextField name="name" label="Project name" />
          <SubmitButton>Rename</SubmitButton>
        </Stack>
      </Form>
      <DataList>
        <DataList.Item label="isDirty">{status.isDirty ? 'Edited' : 'As loaded'}</DataList.Item>
        <DataList.Item label="isSubmitting">
          {status.isSubmitting ? 'Saving' : 'Idle'}
        </DataList.Item>
        <DataList.Item label="canSubmit">{status.canSubmit ? 'Ready' : 'Blocked'}</DataList.Item>
        <DataList.Item label="submitCount">{String(status.submitCount)}</DataList.Item>
      </DataList>
    </Stack>
  )
}

/** Form-wide status as primitives: edit the name and `isDirty` follows it; submit and the count goes up. */
export const Playground: Story = {
  render: () => <RenameProject />,
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.getByText('As loaded')).toBeInTheDocument()
    await userEvent.type(canvas.getByLabelText('Project name'), ' 2027')
    await expect(canvas.getByText('Edited')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Rename' }))
    await expect(await canvas.findByText('1')).toBeInTheDocument()
  },
}
