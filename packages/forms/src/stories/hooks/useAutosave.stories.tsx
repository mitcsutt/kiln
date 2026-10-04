import { Stack } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { Form } from '#components/Form'
import { FormStatus } from '#components/FormStatus'
import { useAutosave } from '#core/hooks'
import { kit } from '#kit'

const meta = {
  title: 'Forms/Hooks/useAutosave',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Stands in for a request to your API. */
const save = () => new Promise((resolve) => setTimeout(resolve, 300))

function MeetingNotes() {
  const form = kit.useAppForm({ defaultValues: { notes: '' } })
  useAutosave(form, save, { debounceMs: 400 })
  return (
    <Form form={form} aria-label="Meeting notes">
      <Stack gap={4}>
        <form.TextareaField name="notes" label="Notes from Tuesday's planning meeting" />
        <FormStatus />
      </Stack>
    </Form>
  )
}

/** Type and pause: the notes save on their own, and `FormStatus` reports each step. */
export const Playground: Story = {
  render: () => <MeetingNotes />,
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.type(
      canvas.getByLabelText("Notes from Tuesday's planning meeting"),
      'Move the launch to March.',
    )
    await expect(await canvas.findByText(/saved/i, {}, { timeout: 3000 })).toBeInTheDocument()
  },
}
