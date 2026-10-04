<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# FormReview

> The same fields, rendered as a list of answers to check. For the last step of a wizard.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/form-review

`FormReview` renders the fields inside it in view mode: a description list of labels and formatted values. Reuse the JSX (or schema subtree) of earlier steps to build a "check your answers" step.

```tsx
import { Form, FormReview, useAppForm } from '@mitcsutt/kiln-forms'

export default function Usage() {
  const form = useAppForm({
    defaultValues: {
      from: 'Harbour Square',
      to: 'Kelso Bay Pier',
      date: '2026-10-14',
      ticket: 'return',
      fare: 8.4,
    },
  })
  return (
    <Form form={form} aria-label="Your booking">
      <FormReview title="Your booking">
        <form.TextField name="from" label="From" />
        <form.TextField name="to" label="To" />
        <form.DateField name="date" label="Date" />
        <form.SegmentedField
          name="ticket"
          label="Ticket"
          options={[
            { value: 'single', label: 'Single' },
            { value: 'return', label: 'Return' },
          ]}
        />
        <form.AmountField name="fare" label="Fare" currency="GBP" locale="en-GB" />
      </FormReview>
    </Form>
  )
}
```

`onEdit` with `step` adds an Edit button that takes the reader back to that step. No field instances are created in view mode, so a review never interferes with the fields it repeats.

## In a schema

```json
{ "layout": "review", "title": "Your booking", "children": [] }
```

## API

`FormReviewProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` |  |  |
| `headingLevel` | `2 \| 3 \| 4` | `3` | Default 3. |
| `step` | `string` |  | The wizard step this block reviews. With it, an Edit button calls `onEdit(step)` — or, inside `FormSteps` without `onEdit`, goes back to that step. |
| `onEdit` | `(step: string) => void` |  |  |
| `editLabel` | `string` | `messages.edit` | The Edit button's text. Default `messages.edit` ("Edit"); with a `title`, the button is also described by it, so several Edit buttons stay distinguishable. |
| `children` (required) | `ReactNode` |  |  |
