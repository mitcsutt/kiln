import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'

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

export function Usage() {
  const form = useAppForm<Feedback>({ defaultValues: { rating: null, comments: '' } })
  return (
    <Form form={form} aria-label="Rate your crossing">
      <SchemaForm form={form} schema={schema} />
    </Form>
  )
}
