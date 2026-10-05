<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# ErrorSummary

> After a failed submit, every error in one alert, each a link to its field. The GOV.UK pattern.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/error-summary

`ErrorSummary` renders nothing until a submit attempt fails. Then it shows a critical alert listing every error in document order, each a link that focuses its field (revealing the tab, accordion item or step it's in). Form-level errors are listed first. It's announced on every failed submit, and with the default `focusOnInvalid`, focus moves to it.

```tsx
import { ErrorSummary, Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() ? undefined : message),
})

export function Usage() {
  const form = useAppForm({ defaultValues: { name: '', email: '', reference: '' } })
  return (
    <Form form={form} aria-label="Claim a refund">
      <Stack gap={5}>
        <ErrorSummary title="Check these before you claim" />
        <form.TextField name="name" label="Full name" validators={required('Enter your name')} />
        <form.TextField
          name="email"
          label="Email"
          type="email"
          validators={required('Enter your email')}
        />
        <form.TextField
          name="reference"
          label="Booking reference"
          validators={required('Enter the booking reference')}
        />
        <SubmitButton>Claim refund</SubmitButton>
      </Stack>
    </Form>
  )
}
```

Press the button with the fields empty, then follow a link. Put the summary at the top of the form, where a reader returning to it starts. Fields inside still show their own errors.

## In a schema

```json
{ "content": "errorSummary" }
```

## API

`ErrorSummaryProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `form` | `AnyKitForm` |  | Defaults to the form in context. |
| `title` | `ReactNode` | `messages.errorSummaryTitle` | Default `messages.errorSummaryTitle` ("There is a problem"). |
| `headingLevel` | `2 \| 3 \| 4` | `2` | The title's heading level. Default 2. |
