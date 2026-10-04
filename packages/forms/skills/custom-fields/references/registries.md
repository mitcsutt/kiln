<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Registries

> Options loaders, custom validators, computed values and custom nodes, registered with the kit and referenced by key.

Source: https://kiln.mitchellsutton.com/docs/forms/schema/registries

A schema is JSON, so it can't contain functions. Instead the kit holds them, and the schema refers to them by key. Typed schemas check the keys: referencing a loader that isn't registered is a type error.

```tsx
import {
  defineComputer,
  defineCustomNode,
  defineLoader,
  defineValidator,
  Form,
  kit,
} from '@mitcsutt/kiln-forms'
import { Alert } from '@mitcsutt/kiln-ui'

// Functions can't live in JSON, so the kit holds them and the schema names them.
const stops = defineLoader<string>(({ query }) =>
  Promise.resolve(
    ['Harbour Square', 'Kelso Bay Pier', 'Marram Point', 'Old Quay']
      .filter((stop) => stop.toLowerCase().includes(query.toLowerCase()))
      .map((stop) => ({ value: stop, label: stop })),
  ),
)
const bookingReference = defineValidator<string>((value) =>
  /^BAY-\w{3}$/.test(value) ? undefined : 'References look like BAY-40Q',
)
const total = defineComputer((values) => {
  const { adults, children } = values as { adults: number | null; children: number | null }
  return (adults ?? 0) * 4.2 + (children ?? 0) * 2.1
})
const notice = defineCustomNode<{ text: string }>(({ props }) => (
  <Alert tone="info">{props.text}</Alert>
))

const bay = kit.extend({
  loaders: { stops },
  validators: { bookingReference },
  computers: { total },
  nodes: { notice },
})

interface Change {
  reference: string
  stop: string | null
  adults: number | null
  children: number | null
  total: number | null
}

const schema = bay.defineFormSchema<Change>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { custom: 'notice', props: { text: 'Changes are free up to an hour before departure.' } },
      {
        kind: 'text',
        name: 'reference',
        label: 'Booking reference',
        rules: [{ rule: 'custom', validator: 'bookingReference' }],
      },
      {
        kind: 'combobox',
        name: 'stop',
        label: 'New boarding stop',
        optionsFrom: { loader: 'stops' },
      },
      { kind: 'number', name: 'adults', label: 'Adults', min: 0 },
      { kind: 'number', name: 'children', label: 'Children', min: 0 },
      {
        kind: 'amount',
        name: 'total',
        label: 'New total',
        currency: 'GBP',
        locale: 'en-GB',
        compute: { computer: 'total', from: ['adults', 'children'] },
      },
      { content: 'submit', label: 'Change booking' },
    ],
  },
})

export default function Registries() {
  const form = bay.useAppForm<Change>({
    defaultValues: { reference: '', stop: null, adults: 2, children: 1, total: 10.5 },
  })
  return (
    <Form form={form} aria-label="Change a booking">
      <bay.SchemaForm form={form} schema={schema} />
    </Form>
  )
}
```

| Registry     | Define with                                                 | Referenced by                                           |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------- |
| `loaders`    | `defineLoader`                                              | `optionsFrom: { "loader": "stops", "deps": [] }`        |
| `validators` | `defineValidator`                                           | `{ "rule": "custom", "validator": "bookingReference" }` |
| `computers`  | `defineComputer`                                            | `compute: { "computer": "total", "from": ["adults"] }`  |
| `nodes`      | `defineCustomNode`                                          | `{ "custom": "notice", "props": { … } }`                |
| `layouts`    | any component                                               | `{ "layout": "leg", "children": [] }`                   |
| `fields`     | a [custom field](../SKILL.md) | `{ "kind": "phone" }`                                   |

Register them once with `kit.extend`, and use the extended kit's `useAppForm`, `defineFormSchema` and `SchemaForm`:

```ts title="src/forms.ts"
import { kit } from '@mitcsutt/kiln-forms'

export const { useAppForm, defineFormSchema, SchemaForm } = kit.extend({
  loaders: { stops },
  validators: { bookingReference },
  computers: { total },
  nodes: { notice },
})
```

```ts
defineLoader<V extends Primitive>(fn: OptionsLoader<V>) => OptionsLoader<V>
```

Registers an options loader for `optionsFrom: { loader: key }` (§10.5). Identity at runtime.

```ts
defineValidator<V = unknown>(fn: (value: V, ctx: ValidatorContext) => ValidatorResult | Promise<ValidatorResult>, opts?: { async?: boolean | undefined; }) => NamedValidator<V>
```

Registers a validator for `{ rule: 'custom', validator: key, args? }` (§10.5). Return a message to
fail, nothing to pass. `async: true` runs it in the async channel (debounced, abortable).

A validator returns a message to fail and nothing to pass. With `{ async: true }` it runs on the async channel, debounced and abortable. It receives the form's values and the rule's `args`.

```ts
defineComputer<Out>(fn: (values: unknown) => Out) => Computer<Out>
```

Registers a derived-value function for `compute: { computer: key, from }` (§10.5).

```ts
defineCustomNode<P extends JsonObject = JsonObject>(component: (props: CustomNodeProps<P>) => ReactNode) => CustomNodeComponent<P>
```

A schema custom node (§10.5): `{ custom: key, props }` renders this component with
`{ form, props, node }`. Register it with `kit.extend({ nodes: { key: … } })`; the node's JSON
`props` are then typed from `P`. Identity at runtime.

A custom node receives `{ form, props, node }`. Its `props` come from JSON and aren't filtered: if it spreads them onto the DOM, filter them first.
