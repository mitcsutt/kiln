<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# FormGrid

> Fields in columns that collapse on small screens, with items that span.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/form-grid

`FormGrid` lays fields out in columns: two from `md` up by default, one below. `FormGridItem` spans columns or starts at one, both responsive. Spacers are `start` offsets; there's no string matrix of field names.

Keep related fields together and in reading order: a grid row is read left to right, then down.

```tsx
import { Form, FormGrid, FormGridItem, useAppForm } from '@mitcsutt/kiln-forms'

export function Usage() {
  const form = useAppForm({
    defaultValues: { street: '', town: '', postcode: '', country: 'GB' },
  })
  return (
    <Form form={form} aria-label="Delivery address">
      <FormGrid columns={{ base: 1, md: 3 }}>
        <FormGridItem span={{ base: 1, md: 3 }}>
          <form.TextField name="street" label="Street" autoComplete="address-line1" />
        </FormGridItem>
        <FormGridItem span={{ base: 1, md: 2 }}>
          <form.TextField name="town" label="Town" autoComplete="address-level2" />
        </FormGridItem>
        <form.TextField name="postcode" label="Postcode" autoComplete="postal-code" />
        <form.SelectField
          name="country"
          label="Country"
          options={[
            { value: 'GB', label: 'United Kingdom' },
            { value: 'IE', label: 'Ireland' },
          ]}
        />
      </FormGrid>
    </Form>
  )
}
```

## In a schema

```json
{
  "layout": "grid",
  "columns": { "base": 1, "md": 3 },
  "children": [
    {
      "layout": "gridItem",
      "span": { "base": 1, "md": 3 },
      "children": [{ "kind": "text", "name": "street", "label": "Street" }]
    },
    { "kind": "text", "name": "postcode", "label": "Postcode" }
  ]
}
```

## API

`FormGridProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | `Responsive<GridColumns>` | `{ base: 1, md: 2 }` | Default `{ base: 1, md: 2 }`: one column on phones, two from `md`. |
| `gap` | `Responsive<Space>` | `5` | Default `5`. |
| `rowGap` | `Responsive<Space>` |  |  |
| `children` (required) | `ReactNode` |  |  |

`FormGridItemProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `span` | `Responsive<GridSpan>` |  |  |
| `start` | `Responsive<GridColumns>` |  | Column to start at — an offset instead of a spacer cell. |
| `children` (required) | `ReactNode` |  |  |
