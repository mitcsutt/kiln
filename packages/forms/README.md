# @mitcsutt/kiln-forms

Typed React forms on [TanStack Form](https://tanstack.com/form), rendered through [`@mitcsutt/kiln-ui`](../ui). Write a form as components, or describe it as a JSON schema: both use the same fields, layouts, validation and accessibility defaults.

## Install

```sh
pnpm add @mitcsutt/kiln-forms @mitcsutt/kiln-ui
```

`@mitcsutt/kiln-ui`, React and React DOM (18.3 or 19) are peer dependencies, so your app has one copy of the UI. The package ships no CSS: import kiln-ui's stylesheet once, as its README describes. The only runtime dependency is `@tanstack/react-form`, which you never import yourself.

## Usage

Component mode: `useAppForm` gives you a form whose fields are typed against your values.

```tsx
import { Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'

export function Signup() {
  const form = useAppForm({
    defaultValues: { name: '', email: '', plan: 'monthly' as 'monthly' | 'yearly' },
    onSubmit: async ({ value }) => {
      await fetch('/api/signups', { method: 'POST', body: JSON.stringify(value) })
    },
  })
  return (
    <Form form={form} aria-label="Sign up">
      <form.TextField name="name" label="Full name" />
      <form.TextField name="email" label="Email" type="email" />
      <form.RadioField
        name="plan"
        label="Plan"
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />
      <SubmitButton>Sign up</SubmitButton>
    </Form>
  )
}
```

Schema mode: validate untrusted JSON with `parseFormSchema`, then render it.

```tsx
import { Form, SchemaForm, parseFormSchema, useAppForm } from '@mitcsutt/kiln-forms'

export function Newsletter({ json }: { json: unknown }) {
  const parsed = parseFormSchema(json, { kinds: ['text'] })
  const form = useAppForm({ defaultValues: { email: '' } })
  if (!parsed.ok) return null
  return (
    <Form form={form} aria-label="Newsletter">
      <SchemaForm form={form} schema={parsed.schema} />
    </Form>
  )
}
```

The React-free `@mitcsutt/kiln-forms/schema` entry runs the same rules on a server:

```ts
import { parseFormSchema, toStandardSchema } from '@mitcsutt/kiln-forms/schema'

const parsed = parseFormSchema(json, { kinds: ['text'] })
if (parsed.ok) {
  const result = await toStandardSchema(parsed.schema)['~standard'].validate(body)
}
```

### Form context and nested components

`<Form form={form}>` puts the form in context, so a component any number of levels below it can reach the form without a `form` prop. Create the options once with `formOptions`, and pass them to `useTypedAppFormContext` to get the form back typed against your values:

```tsx
import type { ReactNode } from 'react'
import {
  Form,
  SubmitButton,
  formOptions,
  useAppForm,
  useFieldValue,
  useFormStatus,
  useTypedAppFormContext,
} from '@mitcsutt/kiln-forms'

const bookingOptions = formOptions({
  defaultValues: { attendee: { name: '', email: '' }, seats: 1 },
})

// Layout components pass children through and never see the form.
function Panel({ children }: { children: ReactNode }) {
  return <section>{children}</section>
}

// Renders bound fields, typed against the form's values.
function AttendeeFields() {
  const form = useTypedAppFormContext(bookingOptions)
  return (
    <>
      <form.TextField name="attendee.name" label="Full name" />
      <form.TextField name="attendee.email" label="Email" type="email" />
      <form.NumberField name="seats" label="Seats" min={1} />
    </>
  )
}

// Subscribes to one value, so only this component re-renders when it changes.
function SeatCount() {
  const form = useTypedAppFormContext(bookingOptions)
  const seats = useFieldValue(form, 'seats')
  return <p>{seats === 1 ? '1 seat' : `${seats} seats`}</p>
}

// Form-wide hooks and components find the form in context by themselves.
function Footer() {
  const { isDirty } = useFormStatus()
  return <SubmitButton>{isDirty ? 'Book' : 'Nothing to book'}</SubmitButton>
}

export function Booking() {
  const form = useAppForm({
    ...bookingOptions,
    onSubmit: async ({ value }) => {
      await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(value) })
    },
  })
  return (
    <Form form={form} aria-label="Book a workshop">
      <Panel>
        <AttendeeFields />
        <SeatCount />
      </Panel>
      <Footer />
    </Form>
  )
}
```

Field names in nested components are type-checked as they are on the form itself. `useTypedAppFormContext` and `useFormContext` (the untyped form, for code that works with any form) throw outside `<Form>` or `<form.AppForm>`. For a section one level down, `withForm` takes the form as a typed prop instead.

Bound fields are also exported on their own, with a `Form` prefix (`FormTextField`, `FormAmountField`, …), so they never share a name with kiln-ui's unbound controls (`TextField`).

## For coding agents

The package ships agent skills in `skills/`, built from the docs pages: component mode, schema mode, custom fields, validation and view mode. They're versioned with the code, so they match the version you've installed. Run this in your project, and [TanStack Intent](https://tanstack.com/intent) adds them to your agent's instructions:

```sh
npx @tanstack/intent@latest install
```

If your `package.json` already has an `intent.skills` list, Intent loads only the packages it names: add `@mitcsutt/kiln-forms` to it, then check with `npx @tanstack/intent@latest list`.

## Docs

Full documentation, with every field, layout and hook, lives on the [Kiln docs site](https://kiln.mitchellsutton.com). Until it's live, see the [design reference](https://github.com/mitcsutt/kiln/blob/main/packages/forms/docs/design.md) in the repository.

## Licence

[MIT](LICENSE)
