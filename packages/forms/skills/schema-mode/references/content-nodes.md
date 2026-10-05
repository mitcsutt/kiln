<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Content nodes

> Headings, text, alerts and dividers, and the submit, reset, error summary and status components, in a schema.

Source: https://kiln.mitchellsutton.com/docs/forms/schema/content-nodes

Content nodes are the parts of a form that aren't fields: the words around them and the form's own components.

```tsx
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
```

| Node                                                                | Renders                                           |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| `{ "content": "heading", "text": "…", "level": 3 }`                 | kiln-ui `Heading`                                 |
| `{ "content": "text", "text": "…" }`                                | kiln-ui `Text` (inline inside a `sentence`)       |
| `{ "content": "alert", "tone": "info", "title": "…", "text": "…" }` | kiln-ui `Alert`                                   |
| `{ "content": "divider" }`                                          | kiln-ui `Divider`                                 |
| `{ "content": "submit", "label": "…" }`                             | [SubmitButton](https://kiln.mitchellsutton.com/docs/forms/layouts/submit-button) |
| `{ "content": "reset", "label": "…" }`                              | [ResetButton](https://kiln.mitchellsutton.com/docs/forms/layouts/reset-button)   |
| `{ "content": "errorSummary" }`                                     | [ErrorSummary](https://kiln.mitchellsutton.com/docs/forms/layouts/error-summary) |
| `{ "content": "status" }`                                           | [FormStatus](https://kiln.mitchellsutton.com/docs/forms/layouts/form-status)     |

Text is always text: content nodes never render HTML from the schema.
