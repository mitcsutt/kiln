<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Server validation

> Run a schema's rules on your server with the React-free schema entry, and trust its output rather than the raw input.

Source: https://kiln.mitchellsutton.com/docs/forms/schema/server-validation

`@mitcsutt/kiln-forms/schema` is the React-free half of the package: parsing, conditions and rules, with no React, no TanStack Form and no kiln-ui. It loads in plain Node. `toStandardSchema(schema)` turns a schema's rules into a [Standard Schema](https://standardschema.dev), so a server enforces exactly what the form does.

```tsx
import { toStandardSchema, type UntypedFormSchema } from '@mitcsutt/kiln-forms/schema'
import { Button, Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

const schema: UntypedFormSchema = {
  version: 1,
  root: {
    layout: 'stack',
    children: [
      {
        kind: 'text',
        name: 'email',
        label: 'Email',
        rules: [{ rule: 'required' }, { rule: 'email' }],
      },
      { kind: 'checkbox', name: 'contact', label: 'Contact me' },
      {
        kind: 'text',
        name: 'phone',
        label: 'Phone',
        when: { field: 'contact', op: 'truthy' },
        rules: [{ rule: 'required' }],
      },
    ],
  },
}

// React-free: this runs the same on a server, in an API handler, as it does here.
const validator = toStandardSchema(schema)

const BODY = { email: 'ines@example', contact: false, phone: '', isAdmin: true }

async function check(): Promise<string> {
  const outcome = await validator['~standard'].validate(BODY)
  return JSON.stringify(outcome.issues ?? { value: outcome.value })
}

export default function Server() {
  const [result, setResult] = useState('')
  return (
    <Stack gap={3} align="start">
      <Text>
        Request body: <Code>{JSON.stringify(BODY)}</Code>
      </Text>
      <Button
        variant="outline"
        tone="neutral"
        onClick={() => {
          void check().then(setResult)
        }}
      >
        Validate on the server
      </Button>
      {result ? <Code>{result}</Code> : null}
    </Stack>
  )
}
```

The phone field is hidden (contact is off), so it isn't validated, and `isAdmin` isn't a field, so it's dropped from the output.

```ts title="api/feedback.ts"
import { parseFormSchema, toStandardSchema } from '@mitcsutt/kiln-forms/schema'

const parsed = parseFormSchema(storedJson, { kinds: ['text', 'checkbox'] })
if (!parsed.ok) throw new Error('Stored schema is invalid')

const result = await toStandardSchema(parsed.schema)['~standard'].validate(await request.json())
if (result.issues) return Response.json({ issues: result.issues }, { status: 422 })
await save(result.value)
```

## Trust the output, not the input

The successful `value` holds only the fields the form itself would validate. Fields that are hidden, excluded, disabled, read-only or computed are left out, and so are unknown keys. Save `value`, and recompute or reload anything read-only or computed that the server needs: never take it from the request.

Custom validators run if you pass them: `toStandardSchema(schema, { validators: { bookingReference } })`.

```ts
toStandardSchema(schema: UntypedFormSchema, opts?: ToStandardSchemaOptions) => StandardSchemaV1<unknown, unknown>
```

The schema's rules as a Standard Schema (§10.9), React-free: use it on the server
(`createServerValidate`, an API handler) so client and server enforce the same rules.

Applies `rules` (+ `required` / `requiredWhen`) of **visible, active** fields only, using the same
`fieldFlags` as the renderer: nodes whose `when` is false are skipped with their subtree, as are
fields that are excluded, disabled or read-only — by their own static prop, a `*When` condition,
`compute`, or an ancestor `section`'s `disabled` / `readOnly` (`layoutFlags`). Those are the
fields the client doesn't validate (§5.4). A repeater under such a section is skipped whole, and
so is every `review` subtree (view mode never validates; the field's own node counts).
Repeater rules apply to the array and item rules to each item. `warnRules` never fail. Returns a
promise only when async custom validators run.

Success output holds only the schema's active fields: unknown keys and the
values of hidden, excluded, disabled, read-only and computed fields are dropped, never passed
through — the server must not trust them (recompute a computed value if it needs one). A
repeater keeps one object per input item with that item's active fields.

## Default values for an unknown schema

`schemaDefaultValues(schema, empties)` builds starting values for a schema whose shape isn't known at build time: each field's `defaultValue`, else the empty value you give for its kind.

```ts
schemaDefaultValues(schema: UntypedFormSchema, empties?: Readonly<Record<string, unknown>>) => Record<string, unknown>
```

Initial values for a schema of unknown shape (server-driven forms, §10.8): each root-scope field
gets its `defaultValue`, else `empties[kind]` when given; each repeater gets `[]`.

## Typed schemas for your own kit

`defineSchemaFor<Registry, Extras>()` returns a `defineFormSchema` bound to a kit's registries, for code that defines schemas without importing the kit itself. An extended kit exposes the same thing as `kit.defineFormSchema`.

```ts
defineSchemaFor<R, X = EmptyObject>() => <T, C = EmptyObject>() => (schema: FormSchema<T, R, X, C>) => FormSchema<T, R, X, C>
```

`defineSchemaFor<R, X>()` → a `defineFormSchema` bound to a kit's registries (the kit
exposes it as `kit.defineFormSchema`). Curried and non-generic in the schema parameter so object
literals get excess-property checks (§10.1): `define<Entry, Ctx>()({ version: 1, root: … })`.
Identity at runtime.
