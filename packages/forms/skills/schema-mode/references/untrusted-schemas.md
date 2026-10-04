<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Untrusted schemas

> Validate schema JSON from a CMS, a database or a client before rendering it, with every problem reported at its path.

Source: https://kiln.mitchellsutton.com/docs/forms/schema/untrusted-schemas

A schema that arrives at runtime (from a CMS, a database, an API) could be wrong, or hostile. Run it through `parseFormSchema` before rendering it, or before using it on a server. It never throws: every problem comes back as an issue with the exact path where it was found.

```tsx
import { kit, parseFormSchema } from '@mitcsutt/kiln-forms'
import { Code, List, Stack, Text } from '@mitcsutt/kiln-ui'

// JSON from a CMS, with the mistakes and hostile props such JSON can carry.
const json: unknown = {
  version: 1,
  root: {
    layout: 'stack',
    children: [
      { kind: 'txt', name: 'name', label: 'Name' },
      { kind: 'text', name: 'email', label: 'Email', onFocus: 'alert(1)' },
      { kind: 'text', name: 'site', label: 'Website', rules: [{ rule: 'minLenght', value: 3 }] },
      { layout: 'colums', children: [] },
    ],
  },
}

const result = parseFormSchema(json, { kinds: Object.keys(kit.registries.fields) })

export default function Untrusted() {
  if (result.ok) return <Text>Valid schema</Text>
  return (
    <Stack gap={3}>
      <Text weight="strong">{result.issues.length} problems, each at its exact path:</Text>
      <List density="compact">
        {result.issues.map((issue) => (
          <List.Item key={issue.path + issue.message}>
            <List.Content>
              <Code>{issue.path}</Code>
              <List.Description>{issue.message}</List.Description>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </Stack>
  )
}
```

```ts
import { parseFormSchema } from '@mitcsutt/kiln-forms/schema'

const result = parseFormSchema(json, { kinds: ['text', 'select', 'checkbox'], loaders: ['stops'] })
if (!result.ok) report(result.issues)
else render(result.schema)
```

The second argument lists the keys the schema may reference: field kinds, layouts, loaders, validators, computers and custom nodes.

## What a valid result guarantees

- Every key it references is registered, and every node, rule and condition has the right shape. Field names and ids are unique, and every repeater has a `newItem`.
- Every prop name is a camelCase React prop, so attributes like `aria-*` and `data-*` can't be set from JSON.
- No prop can reach a DOM sink: `dangerouslySetInnerHTML`, `ref`, `style`, `className`, any `on…` handler, form retargeting (`action`, `formAction`…), and `javascript:`, `vbscript:` and `data:` URLs are all rejected.
- No field `type` of `submit`, `reset`, `button`, `image`, `file` or `hidden`, and no `pattern` prop.
- It's bounded: 64 levels deep, 2,000 nodes.
- No literal `pattern` rules, because no check can promise a regular expression is fast. Register a validator for formats instead. For a source you trust (your own fixtures), pass `{ allowPatterns: true }`: the patterns are then screened by a heuristic, which isn't a guarantee.

## What it doesn't do

- It checks that props are safe, not that they make sense for the component.
- A custom node's `props` aren't filtered. A custom node that spreads them onto the DOM must filter them itself.

The renderer strips the same unsafe props again, as a second line of defence for schemas that skip the parser.

```ts
parseFormSchema(json: unknown, registry: SchemaRegistryNames, options?: ParseFormSchemaOptions) => ParseFormSchemaResult
```

Validates untrusted JSON as a form schema (§10.8) against the kit's registered keys: node shapes,
field kinds / layouts / loaders / validators / computers / custom nodes, rule names and argument
types, condition shapes, duplicate ids and field names, repeater `newItem`, JSON-only props.
Untrusted input: rejects DOM-sink props (`dangerouslySetInnerHTML`, `on*`, `style`,
`javascript:` URLs, … — `unsafeProps.ts`), schemas over `SCHEMA_LIMITS`, and literal `pattern`
rules unless `options.allowPatterns` (then slow-looking patterns are still rejected).
Never throws on hostile JSON: every problem is an issue with its path.
Hand-written (no zod at runtime). On success returns the same object, typed `UntypedFormSchema`.
