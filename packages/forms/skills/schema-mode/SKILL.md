---
name: schema-mode
description: "Use when describing a form as JSON with @mitcsutt/kiln-forms and rendering it with SchemaForm: field, layout, repeater and content nodes, conditions, rules, registries for options and handlers, defineFormSchema, validating the same schema on a server with @mitcsutt/kiln-forms/schema, and accepting schemas from untrusted sources."
metadata:
  purpose: Render forms from JSON schemas with the same fields, layouts and rules as component mode, and check them on the server without React.
  type: core
  library: "@mitcsutt/kiln-forms"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/forms/getting-started/schema-mode.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/index.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/nodes.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/content-nodes.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/conditions.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/rules.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/registries.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/server-validation.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/untrusted-schemas.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Write a form in schema mode

Render forms from JSON schemas with the same fields, layouts and rules as component mode, and check them on the server without React.

In schema mode, a form is a JSON object: a tree of field nodes (`{ kind: 'text', name: 'email' }`), layout nodes (`{ layout: 'grid' }`) and content nodes (`{ content: 'heading' }`). `SchemaForm` renders it with the same components component mode uses, so the two produce the same markup.

```tsx
import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'

interface LostProperty {
  item: string
  route: string | null
  description: string
  contact: boolean
  email: string
}

const schema = defineFormSchema<LostProperty>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { content: 'heading', text: 'Report lost property', level: 3 },
      { kind: 'text', name: 'item', label: 'What did you lose?', rules: [{ rule: 'required' }] },
      {
        kind: 'select',
        name: 'route',
        label: 'Which route?',
        placeholder: 'Choose a route',
        options: [
          { value: 'coastal', label: 'Coastal line' },
          { value: 'harbour', label: 'Harbour loop' },
          { value: 'night', label: 'Night bus N14' },
        ],
        rules: [{ rule: 'required', message: 'Choose the route you were on' }],
      },
      {
        kind: 'textarea',
        name: 'description',
        label: 'Describe it',
        description: 'Colour, brand, anything inside',
      },
      { kind: 'checkbox', name: 'contact', label: 'Email me if it turns up' },
      {
        kind: 'text',
        name: 'email',
        label: 'Email',
        type: 'email',
        when: { field: 'contact', op: 'truthy' },
        rules: [{ rule: 'required' }, { rule: 'email' }],
      },
      { content: 'errorSummary' },
      { content: 'submit', label: 'Send report' },
    ],
  },
})

export default function SchemaFormExample() {
  const form = useAppForm<LostProperty>({
    defaultValues: { item: '', route: null, description: '', contact: false, email: '' },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 500)),
  })
  return (
    <Form form={form} aria-label="Report lost property">
          </Form>
  )
}
```

Tick "Email me if it turns up" and the email field appears; untick it and the field is removed, its rules stop running, and its value goes back to its default before submission.

## Typed schemas

`defineFormSchema<T>()(schema)` checks a schema written in code against your values: field names, option values, condition paths and rule names are all type-checked, and a typo like `lable` is an error. It's curried so that `T` is explicit while the schema still gets excess-property checks.

```ts
const schema = defineFormSchema<LostProperty>()({
  version: 1,
  root: {
    layout: 'stack',
    children: [{ kind: 'text', name: 'item', label: 'What did you lose?' }],
  },
})
```

A schema from a server or a CMS isn't known at build time, so it can't be typed this way. Validate it with [`parseFormSchema`](references/untrusted-schemas.md) before rendering it.

## Rendering part of a schema

`SchemaNode` renders one node by its `id`, so a schema-driven section can sit inside a hand-written form:

```tsx
<Form form={form}>
  <form.TextField name="name" label="Full name" />
  </Form>
```

## Context

`SchemaForm context={{ mode: 'edit' }}` passes values that conditions can read but that aren't form values: whether the form is creating or editing, the reader's role.

## The rest of schema mode

- [Nodes](references/nodes.md): every kind of node and the props it takes.
- [Conditions](references/conditions.md): `when`, `requiredWhen` and friends.
- [Rules](references/rules.md): validation in JSON, and the same rules on your server.
- [Registries](references/registries.md): functions (loaders, validators, computed values, custom nodes) referenced by key.

`SchemaFormProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `form` (required) | `A` |  |  |
| `schema` (required) | `S` |  |  |
| `context` | `SchemaContextOf<S>` |  | Read by `{ context: key, … }` conditions (e.g. create vs edit). |

`SchemaNodeProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` (required) | `string` |  | The node's `id` in the schema. |
| `prefix` | `string` |  | For a node inside a repeater item: the item path (`'guests[2]'`) its names are relative to. |
| `form` (required) | `A` |  |  |
| `schema` (required) | `S` |  |  |
| `context` | `SchemaContextOf<S>` |  | Read by `{ context: key, … }` conditions (e.g. create vs edit). |

## References

Read a reference when its description matches the task:

- [Overview](references/schema.md): The shape of a form schema, how it renders, and what stays out of the JSON.
- [Nodes](references/nodes.md): Field, layout, repeater and custom nodes, and the props each one takes.
- [Content nodes](references/content-nodes.md): Headings, text, alerts and dividers, and the submit, reset, error summary and status components, in a schema.
- [Conditions](references/conditions.md): JSON conditions that show, require, disable or exclude fields, typed against your values.
- [Rules](references/rules.md): Validation as JSON. Required, lengths, patterns, ranges, item counts and custom validators, plus the same rules as warnings.
- [Registries](references/registries.md): Options loaders, custom validators, computed values and custom nodes, registered with the kit and referenced by key.
- [Server validation](references/server-validation.md): Run a schema's rules on your server with the React-free schema entry, and trust its output rather than the raw input.
- [Untrusted schemas](references/untrusted-schemas.md): Validate schema JSON from a CMS, a database or a client before rendering it, with every problem reported at its path.
