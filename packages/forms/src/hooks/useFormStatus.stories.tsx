import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, SubmitButton, useAppForm, useFormStatus } from '@mitcsutt/kiln-forms'
import { DataList, Stack } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { kit } from '#kit/defaultKit'

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

/**
 * `isDirty` compares the current values with the baseline (the defaults, or the last saved
 * values), so undoing an edit makes the form clean again. Inside a `Form`, the `form` argument is
 * optional.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: { route: 'Morning commute' },
      onSubmit: () => new Promise((resolve) => setTimeout(resolve, 1000)),
    })
    const status = useFormStatus(form)
    return (
      <Form form={form} aria-label="Route">
        <Stack gap={5}>
          <form.TextField name="route" label="Route name" />
          <SubmitButton>Save</SubmitButton>
          <DataList>
            <DataList.Item label="Dirty">{String(status.isDirty)}</DataList.Item>
            <DataList.Item label="Submitting">{String(status.isSubmitting)}</DataList.Item>
            <DataList.Item label="Submitted">{String(status.isSubmitted)}</DataList.Item>
            <DataList.Item label="Submit count">{status.submitCount}</DataList.Item>
          </DataList>
        </Stack>
      </Form>
    )
  },
}
