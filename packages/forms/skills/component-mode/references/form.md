<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Form

> The form element, wired to the kit. Submitting runs validation and your onSubmit; disabled, readOnly and view mode cascade to every field.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/form

`Form` renders a `<form noValidate>` and connects it to a form from `useAppForm`. Pressing Enter or a submit button validates and calls your `onSubmit`; a submit while one is already in flight is ignored; a reset button resets the form. It forwards its ref to the `<form>`.

```tsx
import { Form, ResetButton, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export default function Usage() {
  const [sent, setSent] = useState('')
  const form = useAppForm({
    defaultValues: { route: 'Morning commute' },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSent(value.route)
    },
  })
  return (
    <Form form={form} aria-label="Rename route">
      <Stack gap={5}>
        <form.TextField name="route" label="Route name" />
        <Inline gap={3}>
          <SubmitButton>Save name</SubmitButton>
          <ResetButton>Undo changes</ResetButton>
        </Inline>
        {sent ? <Text tone="muted">Saved as {sent}.</Text> : null}
      </Stack>
    </Form>
  )
}
```

Give it an accessible name, with `aria-label` or `aria-labelledby`, so assistive technology can list it as a form landmark.

## Disabled, read-only and view

`disabled` and `readOnly` apply to every field inside, and `mode="view"` renders every field as read-only text (see [View mode](https://kiln.mitchellsutton.com/docs/forms/getting-started/view-mode)).

```tsx
import { Form, useAppForm } from '@mitcsutt/kiln-forms'
import { Grid } from '@mitcsutt/kiln-ui'

function Example({ state }: { state: 'disabled' | 'readOnly' }) {
  const form = useAppForm({ defaultValues: { name: 'Ines Varga', stop: 'Harbour Square' } })
  return (
    <Form
      form={form}
      aria-label={state}
      disabled={state === 'disabled'}
      readOnly={state === 'readOnly'}
    >
      <form.TextField
        name="name"
        label={state === 'disabled' ? 'Name (disabled)' : 'Name (read-only)'}
      />
      <form.TextField name="stop" label="Home stop" />
    </Form>
  )
}

export default function States() {
  return (
    <Grid columns={{ base: 1, sm: 2 }} gap={6}>
                </Grid>
  )
}
```

They mean different things for the payload. A read-only field can be focused and is submitted, but isn't validated. A disabled field can't be focused and isn't validated either. Neither has errors.

## In a schema

A schema renders inside a `Form`: `<Form form={form}></Form>`.

## API

`FormProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `form` (required) | `AnyKitForm` |  | The form from `useAppForm` (or any TanStack form). |
| `mode` | `'view' \| 'edit'` |  | `view` renders every field's display value instead of its control. |
| `disabled` | `boolean` |  | Disables every field inside (not focusable, not validated, submitted as-is). |
| `readOnly` | `boolean` |  | Makes every field read-only (focusable, not editable, not validated). |
| `children` (required) | `ReactNode` |  |  |

Also accepts every prop of `FormHTMLAttributes<HTMLFormElement>`.
