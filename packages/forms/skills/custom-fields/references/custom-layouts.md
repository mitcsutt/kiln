<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Custom layouts

> Write a layout of your own that counts errors, reveals fields on an invalid submit and works in view mode and schema mode.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/custom-layouts

Any component can be a layout. Kiln's own layouts are built from four pieces you can use too.

```tsx
import {
  ErrorSummary,
  FieldScope,
  FieldViewListBoundary,
  Form,
  SubmitButton,
  useAppForm,
  useFieldScope,
  useScopeErrors,
} from '@mitcsutt/kiln-forms'
import { Badge, Box, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

function Count() {
  const scope = useFieldScope()
  const errors = useScopeErrors(scope)
  return errors > 0 ? <Badge tone="critical">{errors}</Badge> : null
}

/** A layout of your own: a framed group that counts the errors inside it. */
function Leg({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FieldScope>
      <Box padding={5} border radius="surface">
        <Stack gap={4}>
          <Inline justify="between">
            <Text weight="strong">{title}</Text>
            <Count />
          </Inline>
          <FieldViewListBoundary>{children}</FieldViewListBoundary>
        </Stack>
      </Box>
    </FieldScope>
  )
}

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() ? undefined : message),
})

export default function Usage() {
  const form = useAppForm({ defaultValues: { outFrom: '', outTo: '', backFrom: '', backTo: '' } })
  return (
    <Form form={form} aria-label="Return journey">
      <Stack gap={5}>
        <ErrorSummary />
        <Leg title="Outward">
          <form.TextField
            name="outFrom"
            label="From"
            validators={required('Enter where you leave from')}
          />
          <form.TextField
            name="outTo"
            label="To"
            validators={required('Enter where you are going')}
          />
        </Leg>
        <Leg title="Return">
          <form.TextField
            name="backFrom"
            label="From"
            validators={required('Enter where you come back from')}
          />
          <form.TextField
            name="backTo"
            label="To"
            validators={required('Enter where you come back to')}
          />
        </Leg>
        <SubmitButton>Find sailings</SubmitButton>
      </Stack>
    </Form>
  )
}
```

Submit it empty and each panel counts its own errors.

## The pieces

- **`FieldScope`** collects the names of the fields mounted inside it. Nested scopes form a chain, and a scope's `reveal` (open the tab, select the step) runs before focus moves to a field inside it on an invalid submit.
- **`useScopeErrors(scope)`** returns how many visible errors a scope holds, as a number, so a badge re-renders only when the count changes. `useFieldScope()` returns the nearest scope.
- **`FieldPresentation`** tells the fields below it how to render: `layout`, `labelHidden`, `errorPlacement`, `mode`, `disabled`, `readOnly`. It merges with any presentation above it. `useFieldPresentation()` reads it.
- **`FieldViewListBoundary`** keeps view mode valid: fields below it render their own description lists instead of adding items to a list above.

`useFormContext()` returns the form inside any `Form`, for a layout that needs form state without a `form` prop.

```ts
declare function useScopeErrors(scope: ScopeHandle | null, form?: AnyKitForm | undefined): number
```

The number of **visible** errors (per the form's visibility policy) among the scope's fields.
A primitive selector — re-renders only when the count changes.

```ts
declare function useFieldScope(): ScopeHandle | null
```

The nearest scope, or `null`.

## Keeping hidden fields alive

A layout that hides fields (tabs, accordion items, steps) should keep them mounted with `hidden` rather than unmounting them, so they keep validating, counting and holding values. Pass a `reveal` to the scope that shows them.

## In schema mode

Register the layout with the kit, and it becomes a schema `layout` key. A custom layout receives `{ node, form, children }`, with `children` already rendered:

```ts
export const { useAppForm, SchemaForm } = kit.extend({ layouts: { leg: LegLayout } })
```

```json
{ "layout": "leg", "title": "Outward", "children": [] }
```

## API

`FieldScopeProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `reveal` | `() => void` |  | Makes this region visible; focus management calls it before focusing a field inside. |
| `names` | `readonly string[]` |  | Static names (schema mode) governed even before their fields mount. |
| `onNamesChange` | `(names: readonly string[]) => void` |  | Called whenever the set of names changes. |
| `children` (required) | `ReactNode` |  |  |

`FieldPresentationProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `layout` | `'horizontal' \| 'inline' \| 'stack'` |  |  |
| `labelHidden` | `boolean` |  |  |
| `errorPlacement` | `'external' \| 'inline'` |  | `external`: the field keeps its invalid state but its message renders elsewhere (sentence, table). |
| `mode` | `'view' \| 'edit'` |  | `view` renders each field's display value, no control (FormReview, `Form mode="view"`). |
| `disabled` | `boolean` |  | Cascades; a nested `false` cannot re-enable. |
| `readOnly` | `boolean` |  | Cascades; a nested `false` cannot make it editable. |
| `describedBy` | `(name: string) => string \| undefined` |  | For `errorPlacement: 'external'`: the id of the element showing a field's message. |
| `children` (required) | `ReactNode` |  |  |

Also accepts every prop of `Partial<FieldPresentationValue>`.
