<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# FormSection

> A titled group of fields, as a fieldset and legend, that can be disabled or made read-only as one.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/form-section

`FormSection` groups fields under a title. By default it's a `<fieldset>` with the title as its `<legend>`, so screen readers announce the group with each field. `as="section"` makes it a `<section>` with a heading instead, for a chapter of a long form.

```tsx
import { Form, FormSection, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({
    defaultValues: { name: 'Ines Varga', email: 'ines@example.com', card: '4417', expiry: '09/28' },
  })
  return (
    <Form form={form} aria-label="Account">
      <Stack gap={7}>
        <FormSection title="Contact details" description="Where we send tickets and receipts.">
          <form.TextField name="name" label="Full name" />
          <form.TextField name="email" label="Email" type="email" />
        </FormSection>
        <FormSection
          title="Saved card"
          description="Managed by your bank. Contact them to change it."
          readOnly
        >
          <form.TextField name="card" label="Card ending" />
          <form.TextField name="expiry" label="Expires" />
        </FormSection>
      </Stack>
    </Form>
  )
}
```

`disabled` and `readOnly` cascade to every field inside. `title` is required: a fieldset without a legend isn't a section, so use a `Stack` for plain grouping. `titleHidden` keeps the title for screen readers only.

## In a schema

```json
{
  "layout": "section",
  "title": "Contact details",
  "children": [{ "kind": "text", "name": "name", "label": "Full name" }]
}
```

## API

`FormSectionProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `titleHidden` | `boolean` |  | Keeps the title for assistive tech but hides it visually. |
| `as` | `'section' \| 'fieldset'` | `fieldset` | `fieldset` (default): a group of related fields. `section`: a headed chapter. |
| `headingLevel` | `2 \| 3 \| 4` | `3` | Heading level for `as="section"`. Default 3. |
| `disabled` | `boolean` |  | Disables every field inside (native fieldset cascade + presentation). |
| `readOnly` | `boolean` |  | Makes every field inside read-only (presentation cascade). |
| `gap` | `Responsive<Space>` | `5` | Default `5`. |
| `children` (required) | `ReactNode` |  |  |
