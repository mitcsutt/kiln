<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Rules

> Validation as JSON. Required, lengths, patterns, ranges, item counts and custom validators, plus the same rules as warnings.

Source: https://kiln.mitchellsutton.com/docs/forms/schema/rules

`rules` validate a field in a schema; `warnRules` run the same rules on the warning channel, as advice that never blocks. Rules follow the same timing as component mode: after a field is left, then live.

```tsx
import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'

interface Signup {
  email: string
  username: string
  age: number | null
  stops: string[]
}

const schema = defineFormSchema<Signup>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { content: 'errorSummary' },
      {
        kind: 'text',
        name: 'email',
        label: 'Email',
        type: 'email',
        rules: [{ rule: 'required' }, { rule: 'email' }],
      },
      {
        kind: 'text',
        name: 'username',
        label: 'Username',
        rules: [
          { rule: 'minLength', value: 3 },
          { rule: 'maxLength', value: 20, message: 'Keep it under 20 characters' },
        ],
        // The same rules on the warning channel: advice that never blocks.
        warnRules: [
          { rule: 'maxLength', value: 12, message: 'Short usernames are easier to share' },
        ],
      },
      {
        kind: 'number',
        name: 'age',
        label: 'Age',
        rules: [
          { rule: 'min', value: 16, message: 'You need to be 16 or over' },
          { rule: 'integer' },
        ],
      },
      {
        kind: 'checkboxGroup',
        name: 'stops',
        label: 'Stops you use',
        options: [
          { value: 'harbour', label: 'Harbour Square' },
          { value: 'kelso', label: 'Kelso Bay Pier' },
          { value: 'marram', label: 'Marram Point' },
        ],
        rules: [{ rule: 'minItems', value: 1, message: 'Choose at least one stop' }],
      },
      { content: 'submit', label: 'Sign up' },
    ],
  },
})

export function Usage() {
  const form = useAppForm<Signup>({
    defaultValues: { email: '', username: '', age: null, stops: [] },
  })
  return (
    <Form form={form} aria-label="Sign up">
      <SchemaForm form={form} schema={schema} />
    </Form>
  )
}
```

## The rules

| Rule                             | For          | Checks                                                       |
| -------------------------------- | ------------ | ------------------------------------------------------------ |
| `required`                       | any field    | there's a value (a checkbox is ticked, an array isn't empty) |
| `minLength`, `maxLength`         | strings      | the length, with `value`                                     |
| `email`, `url`                   | strings      | the format                                                   |
| `pattern`                        | strings      | a regular expression in `value`, with optional `flags`       |
| `min`, `max`, `step`, `integer`  | numbers      | the range and granularity                                    |
| `minDate`, `maxDate`             | date strings | the ISO date bounds                                          |
| `minItems`, `maxItems`, `unique` | arrays       | the count, and no duplicates (`by` names a key in objects)   |
| `custom`                         | any field    | a validator you registered, by key, with optional `args`     |

In a typed schema, only the rules that fit a field's value are allowed: `minLength` on a number is a type error. Each rule takes an optional `message`, as literal text or a `$key` into the kit's messages; the default messages interpolate `{value}`.

## Patterns in untrusted schemas

A regular expression can be made to run for a very long time on a crafted input. `parseFormSchema` rejects `pattern` rules from untrusted JSON unless you pass `allowPatterns` for a source you trust. For formats like an email address or a slug, register a validator and use `{ "rule": "custom", "validator": "slug" }` instead. See [Untrusted schemas](./untrusted-schemas.md).

## With a form schema

Rules and a form-level Standard Schema (`useAppForm({ schema })`) can be used together; both run.

## On the server

[`toStandardSchema`](./server-validation.md) turns a schema's rules into a Standard Schema that runs anywhere, so the server enforces exactly what the form does.
