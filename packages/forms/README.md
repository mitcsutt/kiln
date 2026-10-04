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

Bound fields are also exported on their own, with a `Form` prefix (`FormTextField`, `FormAmountField`, …), so they never share a name with kiln-ui's unbound controls (`TextField`).

## For coding agents

The package ships agent skills in `skills/`, built from the docs pages: component mode, schema mode, custom fields, validation and view mode. They're versioned with the code, so they match the version you've installed. Run this in your project, and [TanStack Intent](https://tanstack.com/intent) adds them to your agent's instructions:

```sh
npx @tanstack/intent@latest install
```

## Docs

Full documentation, with every field, layout and hook, lives on the [Kiln docs site](https://kiln.mitchellsutton.com). Until it's live, see the [design reference](https://github.com/mitcsutt/kiln/blob/main/packages/forms/docs/design.md) in the repository.

## Licence

[MIT](LICENSE)
