<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# When

> Shows fields only when a condition holds. Hidden fields stop validating and are reset in what's submitted.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/when

`When` renders its children only while a condition holds. Hidden fields unmount, so their validators stop, their errors clear, and by default their values go back to their defaults in what `onSubmit` receives. What the reader typed survives hiding and showing while they're editing; only the payload is pruned.

Choose "Post it to me", type an address, switch back to collecting, and submit: the address is submitted empty.

- `is` takes a function of the values. `condition` takes the JSON condition schema mode uses.
- `whenHidden` is `'prune'` (the default), `'keep'` (submit the hidden value anyway) or `'reset'` (clear it as soon as it hides).
- `names` lists paths the block governs that haven't been shown yet, such as a hidden server value in an edit form.
- `fallback` renders in place of the children while hidden.

It re-renders only when visibility flips, not on every change.

```tsx
import { Form, SubmitButton, useAppForm, When } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [submitted, setSubmitted] = useState('')
  const form = useAppForm({
    defaultValues: { delivery: 'collect', address: '' },
    onSubmit: ({ value }) => {
      setSubmitted(JSON.stringify(value))
    },
  })
  return (
    <Form form={form} aria-label="Pass delivery">
      <Stack gap={5}>
        <form.RadioField
          name="delivery"
          label="How do you want your pass?"
          options={[
            { value: 'collect', label: 'Collect it at Harbour Square' },
            { value: 'post', label: 'Post it to me' },
          ]}
        />
        <When form={form} is={(values) => values.delivery === 'post'}>
          <form.TextareaField name="address" label="Postal address" autoComplete="street-address" />
        </When>
        <SubmitButton>Order pass</SubmitButton>
        {submitted ? (
          <Text size="sm" tone="muted">
            Submitted: <Code>{submitted}</Code>
          </Text>
        ) : null}
      </Stack>
    </Form>
  )
}
```

## Animated

With `animate`, the fields grow into place when they appear and shrink away before they unmount, so the rest of the form slides instead of jumping. It uses kiln-ui's `Collapse`, so it moves with the theme's motion and changes at once when the reader asks for reduced motion.

The children sit in one block, so put an animated `When` where fields stack (a `Stack`, a `FormSection`), not straight inside a `FormGrid`. In a schema, `"whenAnimate": true` on the node does the same.

```tsx
import { Form, SubmitButton, useAppForm, When } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export function Animated() {
  const form = useAppForm({
    defaultValues: { invoice: false, company: '', taxNumber: '' },
  })
  return (
    <Form form={form} aria-label="Billing">
      <Stack gap={5}>
        <form.SwitchField name="invoice" label="I need a tax invoice" />
        <When form={form} is={(values) => values.invoice} animate>
          <Stack gap={5}>
            <form.TextField name="company" label="Company name" autoComplete="organization" />
            <form.TextField name="taxNumber" label="Tax number" />
          </Stack>
        </When>
        <SubmitButton>Continue to payment</SubmitButton>
      </Stack>
    </Form>
  )
}
```

## In a schema

Any node takes `when`:

```json
{
  "kind": "textarea",
  "name": "address",
  "label": "Postal address",
  "when": { "field": "delivery", "op": "eq", "value": "post" }
}
```

See [Conditions](https://kiln.mitchellsutton.com/docs/forms/schema/conditions) for every operator. `"whenAnimate": true` is the schema's `animate`.

## API

`WhenProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `form` (required) | `A` |  |  |
| `is` | `((values: ValuesOf<A>) => boolean)` |  | Component mode: visible while this returns `true`. Subscribes with a boolean selector. |
| `condition` | `Condition<ValuesOf<A>>` |  | Or a JSON condition (the schema-mode `Condition`). Ignored when `is` is given. |
| `context` | `Record<string, unknown>` |  |  |
| `whenHidden` | `'reset' \| 'keep' \| 'prune'` | `'prune'` | `'prune'` (default): submitted as the field's default; the user's input survives hide/show. `'keep'`: submitted as the current value. `'reset'`: reset to the default when hidden. |
| `names` | `readonly DeepKeys<ValuesOf<A>>[]` |  | Paths it governs that may never have mounted (edit mode with a hidden server value). |
| `fallback` | `ReactNode` |  | Rendered instead while hidden. |
| `animate` | `boolean` | `false` | Animate the change: the children grow open when they appear and shrink closed before they unmount (the `fallback` the other way round), with kiln-ui's `Collapse`. It wraps them in a block element, so use it where they stack, not straight inside a grid. Ignored in view mode and in inline layouts (a sentence, a table row). Default `false`. |
| `children` (required) | `ReactNode` |  |  |
| `scopeNames` | `readonly string[]` |  |  |

`Condition`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `field` | `K` |  |  |
| `op` | `'empty' \| 'in' \| 'eq' \| 'neq' \| 'notIn' \| 'truthy' \| 'falsy' \| 'notEmpty'` |  |  |
| `value` | `number` |  |  |
| `context` | `K` |  |  |
| `all` | `readonly Condition<T, C>[]` |  |  |
| `any` | `readonly Condition<T, C>[]` |  |  |
| `not` | `Condition<T, C>` |  |  |
