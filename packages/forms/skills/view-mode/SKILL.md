---
name: view-mode
description: 'Use when showing the values of a @mitcsutt/kiln-forms form as read-only text, for a detail page or the review step of a wizard: Form mode="view", FormReview, FieldPresentation and how each field formats its value.'
metadata:
  purpose: Render the same form definition as labelled, formatted values instead of controls.
  type: core
  library: "@mitcsutt/kiln-forms"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/forms/getting-started/view-mode.mdx
  - mitcsutt/kiln:packages/forms/src/components/layouts/FormReview/FormReview.tsx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Show a form read-only in view mode

Render the same form definition as labelled, formatted values instead of controls.

A form in view mode renders each field as its label and its value, formatted for reading, in a description list. The same JSX (or schema) serves the edit page and the read-only detail page.

```tsx
import { Form, useAppForm } from '@mitcsutt/kiln-forms'
import { SegmentedControl, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [mode, setMode] = useState<'edit' | 'view'>('view')
  const form = useAppForm({
    defaultValues: {
      name: 'Ines Varga',
      pass: 'annual',
      fare: 790,
      alerts: true,
      days: ['mon', 'wed', 'fri'] as string[],
    },
  })
  return (
    <Stack gap={5}>
      <SegmentedControl
        aria-label="Mode"
        value={mode}
        onValueChange={(value) => {
          setMode(value === 'edit' ? 'edit' : 'view')
        }}
        options={[
          { value: 'view', label: 'View' },
          { value: 'edit', label: 'Edit' },
        ]}
      />
      <Form form={form} mode={mode} aria-label="Pass holder">
        <Stack gap={5}>
          <form.TextField name="name" label="Name" />
          <form.SelectField
            name="pass"
            label="Pass"
            options={[
              { value: 'week', label: 'Week pass' },
              { value: 'annual', label: 'Annual pass' },
            ]}
          />
          <form.AmountField name="fare" label="Paid" currency="GBP" locale="en-GB" />
          <form.SwitchField name="alerts" label="Delay alerts" />
          <form.ChipsField
            name="days"
            label="Travel days"
            options={['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => ({
              value: day,
              label: day.charAt(0).toUpperCase() + day.slice(1),
            }))}
          />
        </Stack>
      </Form>
    </Stack>
  )
}
```

Select fields show the option's label, amounts are formatted for their currency, switches read "Yes" or "No", and anything empty reads "Not provided". Passwords are always a fixed-length mask, so the view doesn't even leak the length.

## Three ways in

- `<Form mode="view">` for a whole form.
- [`FormReview`](references/form-review.md) for part of one, like the last step of a wizard repeating earlier answers.
- `FieldPresentation mode="view"`, for custom layouts.

## No field instances

In view mode no TanStack field is created for a path. A review step that repeats an earlier step's fields doesn't take over those fields' validators or state. Fields that load options (a combobox with `loadOptions`) make no request.

If you use TanStack's render-prop `form.AppField` in view mode, its `field` is a read-only stand-in: it has the value and the kit's field components, but setting values does nothing and it has no array helpers.

## References

Read a reference when its description matches the task:

- [FormReview](references/form-review.md): The same fields, rendered as a list of answers to check. For the last step of a wizard.
