import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormStatus, useAppForm, useAutosave } from '@mitcsutt/kiln-forms'
import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { kit } from '#kit/defaultKit'

const meta = {
  title: 'Forms/Hooks/useAutosave',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Stands in for a request to your API. */
const saveNotes = () => new Promise((resolve) => setTimeout(resolve, 300))

function MeetingNotes() {
  const form = kit.useAppForm({ defaultValues: { notes: '' } })
  useAutosave(form, saveNotes, { debounceMs: 400 })
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

function save(_values: unknown, { signal }: { signal: AbortSignal }) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 900)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Superseded'))
    })
  })
}

/**
 * By default it saves only when the form is valid. Before each save it runs the edited fields'
 * validators, even before a field's first blur, so a stale "valid" never lets a bad value through.
 * The errors it finds stay hidden until the form's normal error timing shows them.
 *
 * Don't autosave a password or anything else that shouldn't persist half-typed: give it its own
 * form with a submit button, as [Account settings](/docs/forms/getting-started/account-settings)
 * does.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { title: 'Summer timetable', notes: '' } })
    const state = useAutosave(form, save, { debounceMs: 600 })
    return (
      <Form form={form} aria-label="Draft">
        <Stack gap={5}>
          <Inline justify="between">
            <Text weight="strong">Draft</Text>
            <FormStatus />
          </Inline>
          <form.TextField name="title" label="Title" />
          <form.TextareaField name="notes" label="Notes" autoResize />
          <Text size="sm" tone="muted">
            Autosave status: {state.status}
          </Text>
        </Stack>
      </Form>
    )
  },
}
