<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Conditions

> JSON conditions that show, require, disable or exclude fields, typed against your values.

Source: https://kiln.mitchellsutton.com/docs/forms/schema/conditions

A condition is a small JSON expression over the form's values. It decides whether a node is shown (`when`), and whether a field is required, disabled, read-only or excluded (`requiredWhen`, `disabledWhen`, `readOnlyWhen`, `excludeWhen`).

```tsx
import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'

interface Booking {
  ticket: 'single' | 'return' | null
  returnDate: string
  group: number | null
  groupLeader: string
  promo: string
}

const schema = defineFormSchema<Booking, { member: boolean }>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      {
        kind: 'segmented',
        name: 'ticket',
        label: 'Ticket',
        options: [
          { value: 'single', label: 'Single' },
          { value: 'return', label: 'Return' },
        ],
      },
      // Shown only for returns.
      {
        kind: 'date',
        name: 'returnDate',
        label: 'Return date',
        when: { field: 'ticket', op: 'eq', value: 'return' },
      },
      { kind: 'number', name: 'group', label: 'Passengers', min: 1, max: 20 },
      // Required once the group is bigger than eight.
      {
        kind: 'text',
        name: 'groupLeader',
        label: 'Group leader',
        description: 'Required for groups of more than eight',
        requiredWhen: { field: 'group', op: 'gt', value: 8 },
      },
      // Locked unless the reader is a member, read from the render context.
      {
        kind: 'text',
        name: 'promo',
        label: 'Member code',
        disabledWhen: { not: { context: 'member', op: 'eq', value: true } },
      },
      { content: 'submit', label: 'Book' },
    ],
  },
})

export default function Conditions() {
  const form = useAppForm<Booking>({
    defaultValues: { ticket: 'single', returnDate: '', group: 2, groupLeader: '', promo: '' },
  })
  return (
    <Form form={form} aria-label="Book a sailing">
      <SchemaForm form={form} schema={schema} context={{ member: false }} />
    </Form>
  )
}
```

Choose a return ticket to show the return date, set passengers above eight to make the group leader required, and note the member code stays disabled because the render context says the reader isn't a member.

## Operators

| Condition                                                  | True when                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| `{ "field": "ticket", "op": "eq", "value": "return" }`     | the field equals the value (`neq` for not equal)              |
| `{ "field": "zone", "op": "in", "value": [1, 2] }`         | the field is one of the values (`notIn` for none of them)     |
| `{ "field": "group", "op": "gt", "value": 8 }`             | a number field is greater than the value (`gte`, `lt`, `lte`) |
| `{ "field": "contact", "op": "truthy" }`                   | the value is truthy (`falsy` for the opposite)                |
| `{ "field": "notes", "op": "empty" }`                      | the value is `''`, `null`, `undefined` or `[]` (`notEmpty`)   |
| `{ "context": "mode", "op": "eq", "value": "edit" }`       | a value in `SchemaForm`'s `context` matches (`neq`, `in`)     |
| `{ "all": [ … ] }`, `{ "any": [ … ] }`, `{ "not": { … } }` | every, any or none of the nested conditions holds             |

In a typed schema, `field` must be a real path, `value` must fit it, and the number comparisons only accept number fields. Paths are root paths everywhere, including inside repeater items.

## Hidden means gone

A node whose `when` is false is unmounted: its rules stop running, its errors clear, and its values are pruned to their defaults before submission (unless `whenHidden` says otherwise). `toStandardSchema` applies the same conditions on the server, so a hidden field is never validated there either.

## Evaluating one yourself

`evaluateCondition(condition, values, context)` is pure and React-free, for code that needs the same answer outside a form.

```ts
declare function evaluateCondition(c: UntypedCondition, values: unknown, context?: Record<string, unknown>): boolean
```

Evaluates a JSON condition (§10.3) against form values (root paths) and the render context.
Pure: no React, no form instance. `all: []` is true, `any: []` is false.
