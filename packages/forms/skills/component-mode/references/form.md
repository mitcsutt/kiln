<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Form

> The form element, wired to the kit. Submitting runs validation and your onSubmit; disabled, readOnly and view mode cascade to every field.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/form

`Form` renders a `<form noValidate>` and connects it to a form from `useAppForm`. Pressing Enter or a submit button validates and calls your `onSubmit`; a submit while one is already in flight is ignored; a reset button resets the form. It forwards its ref to the `<form>`.

Give it an accessible name, with `aria-label` or `aria-labelledby`, so assistive technology can list it as a form landmark.

```tsx
import { Form, ResetButton, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
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

## Toast on submit

A toast suits news about the submit itself once the reader has moved on: "Profile saved", or "Couldn't save" with a Retry. Raise one with kiln-ui's `toast()` at the end of `onSubmit`, and from `onSubmitError` for a throw that isn't a `FormSubmitError`. Mount a `Toaster` once near the root of the app; kiln-forms doesn't need one and never raises a toast itself.

Errors the reader can fix belong beside their fields: throw a `FormSubmitError` and they land there, with focus on the first. Don't toast validation errors. An `onSubmitError` of your own replaces the default form-level "Something went wrong" message, so the toast is the only report.

```tsx
import { Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Inline, Stack, Toaster, toast } from '@mitcsutt/kiln-ui'
import { useRef } from 'react'

export function ToastOnSubmit() {
  const attempts = useRef(0)
  const form = useAppForm({
    defaultValues: { displayName: 'Ines Varga' },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 400))
      // Pretend the first save loses its connection.
      attempts.current += 1
      if (attempts.current === 1) throw new Error('Network unreachable')
      toast({
        id: 'profile-save',
        title: 'Profile saved',
        description: `Shown as ${value.displayName}`,
        tone: 'positive',
      })
    },
    onSubmitError: ({ formApi }) => {
      toast({
        id: 'profile-save',
        title: "Couldn't save your profile",
        description: 'Check your connection and try again.',
        tone: 'critical',
        action: {
          label: 'Retry',
          altText: 'Press Save profile again',
          onClick: () => void formApi.handleSubmit(),
        },
      })
    },
  })
  return (
    <Form form={form} aria-label="Profile">
      <Stack gap={5}>
        <form.TextField name="displayName" label="Display name" autoComplete="nickname" />
        <Inline gap={3}>
          <SubmitButton>Save profile</SubmitButton>
        </Inline>
      </Stack>
      <Toaster />
    </Form>
  )
}
```

## Disabled, read-only and view

`disabled` and `readOnly` apply to every field inside, and `mode="view"` renders every field as read-only text (see [View mode](https://kiln.mitchellsutton.com/docs/forms/getting-started/view-mode)).

They mean different things for the payload. A read-only field can be focused and is submitted, but isn't validated. A disabled field can't be focused and isn't validated either. Neither has errors.

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

export function States() {
  return (
    <Grid columns={{ base: 1, sm: 2 }} gap={6}>
      <Example state="disabled" />
      <Example state="readOnly" />
    </Grid>
  )
}
```

## In a schema

A schema renders inside a `Form`: `<Form form={form}></Form>`.

## API

`FormProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `form` (required) | `AnyKitForm` |  | The form from `useAppForm` (or any TanStack form). |
| `mode` | `'view' \| 'edit'` |  | `view` renders every field's display value instead of its control. |
| `viewLines` | `number` |  | In view mode (here or in a `FormReview` inside), clamp each value to about this many lines, with a "Show more" toggle. Values that fit show no toggle. Default: no clamp. |
| `disabled` | `boolean` |  | Disables every field inside (not focusable, not validated, submitted as-is). |
| `readOnly` | `boolean` |  | Makes every field read-only (focusable, not editable, not validated). |
| `children` (required) | `ReactNode` |  |  |

Also accepts every prop of `FormHTMLAttributes<HTMLFormElement>`.
