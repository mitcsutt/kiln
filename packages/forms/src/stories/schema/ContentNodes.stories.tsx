import type { Meta, StoryObj } from '@storybook/react-vite'
import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'
import { contentFixture, contentSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'

const meta = {
  title: 'Forms/Schema/Content nodes',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Every `content` kind next to the components it stands for. Submit empty to fill the error summary. */
export const ComponentAndSchema: Story = parityStory(contentFixture, contentSchema, [
  'Heading',
  'Text',
  'ErrorSummary',
  'Alert',
  'Divider',
  'FormStatus',
  'SubmitButton',
])

interface Feedback {
  rating: number | null
  comments: string
}

const schema = defineFormSchema<Feedback>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { content: 'heading', text: 'Rate your crossing', level: 3 },
      { content: 'text', text: 'Two questions. Your answers help us plan the winter timetable.' },
      { content: 'errorSummary' },
      {
        content: 'alert',
        tone: 'info',
        title: 'Anonymous',
        text: "We don't record who sent feedback.",
      },
      {
        kind: 'rating',
        name: 'rating',
        label: 'How was it?',
        rules: [{ rule: 'required', message: 'Choose a rating' }],
      },
      { content: 'divider' },
      { kind: 'textarea', name: 'comments', label: 'Anything else?' },
      { content: 'status' },
      { content: 'submit', label: 'Send feedback' },
    ],
  },
})

/**
 * A feedback form whose headings and words come from content nodes in its schema.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm<Feedback>({ defaultValues: { rating: null, comments: '' } })
    return (
      <Form form={form} aria-label="Rate your crossing">
        <SchemaForm form={form} schema={schema} />
      </Form>
    )
  },
}
