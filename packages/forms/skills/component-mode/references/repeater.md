<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Repeater

> A list of repeated groups of fields, as a list, cards or a table, with add, remove and reorder.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/repeater

`Repeater` edits an array of objects: passengers, legs of a journey, line items. Each item gets typed shorthand fields relative to itself (`item.fields.TextField name="name"`), and the repeater handles adding, removing and moving items, focus after each change, and announcing it.

- `newItem` is the value a new item starts with (or a function returning one).
- `min` and `max` bound the count: at `max`, Add is `aria-disabled` with a reason; at `min`, Remove is hidden.
- `itemLabel` names each item, and `addLabel` names the add button.
- `empty` replaces the default empty state.

```tsx
import { Form, Repeater, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

interface Passenger {
  name: string
  age: number | null
  bike: boolean
}

export function Usage() {
  const form = useAppForm({
    defaultValues: { passengers: [{ name: 'Ines Varga', age: 34, bike: true }] as Passenger[] },
  })
  return (
    <Form form={form} aria-label="Passengers">
      <Stack gap={5}>
        <Repeater
          form={form}
          name="passengers"
          label="Passengers"
          newItem={{ name: '', age: null, bike: false }}
          min={1}
          max={6}
          itemLabel={(index) => `Passenger ${String(index + 1)}`}
          addLabel="Add a passenger"
        >
          {(item) => (
            <>
              <item.fields.TextField name="name" label="Name" />
              <item.fields.NumberField name="age" label="Age" min={0} />
              <item.fields.CheckboxField name="bike" label="Bringing a bike" />
            </>
          )}
        </Repeater>
        <SubmitButton>Continue</SubmitButton>
      </Stack>
    </Form>
  )
}
```

## As a table

`variant="table"` renders each item as a row and each field as a cell, with `columns` giving the headers. Labels stay for assistive technology but aren't shown, and errors render in the cell. `reorderable` adds move up and move down buttons: keyboard first, no dragging.

`variant="cards"` puts each item in a card.

```tsx
import { Form, Repeater, useAppForm } from '@mitcsutt/kiln-forms'

interface Leg {
  from: string
  to: string
  fare: number | null
}

export function Table() {
  const form = useAppForm({
    defaultValues: {
      legs: [
        { from: 'Harbour Square', to: 'Kelso Bay', fare: 4.2 },
        { from: 'Kelso Bay', to: 'Marram Point', fare: 2.8 },
      ] as Leg[],
    },
  })
  return (
    <Form form={form} aria-label="Journey legs">
      <Repeater
        form={form}
        name="legs"
        label="Legs"
        variant="table"
        reorderable
        newItem={{ from: '', to: '', fare: null }}
        columns={[{ header: 'From' }, { header: 'To' }, { header: 'Fare', width: 'min' }]}
        addLabel="Add a leg"
      >
        {(item) => (
          <>
            <item.fields.TextField name="from" label="From" />
            <item.fields.TextField name="to" label="To" />
            <item.fields.AmountField name="fare" label="Fare" currency="GBP" locale="en-GB" />
          </>
        )}
      </Repeater>
    </Form>
  )
}
```

## In a schema

```json
{
  "layout": "repeater",
  "name": "passengers",
  "label": "Passengers",
  "newItem": { "name": "", "age": null },
  "item": [{ "kind": "text", "name": "name", "label": "Name" }]
}
```

## API

`RepeaterProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `form` (required) | `A` |  |  |
| `name` (required) | `N` |  | A path to an array of objects. |
| `label` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `newItem` (required) | `(() => ItemOf<ValuesOf<A>, N>) \| ItemOf<ValuesOf<A>, N>` |  | The item Add appends (or a factory, for fresh ids). |
| `variant` | `'table' \| 'list' \| 'cards'` | `'list'` | Default `'list'`. |
| `min` | `number` | `0` | At `min`, Remove is hidden. Default 0. |
| `max` | `number` |  | At `max`, Add is `aria-disabled` with `messages.maxItems(max)`. |
| `reorderable` | `boolean` |  | Move up / Move down buttons (keyboard-first; no drag). |
| `itemLabel` | `(index: number) => string` | `messages.item(index)` | Default `messages.item(index)` ("Item 1"). |
| `addLabel` | `string` | `messages.add` | Default `messages.add`. |
| `empty` | `ReactNode` |  | Shown when there are no items. |
| `columns` | `readonly { header: ReactNode; width?: TableColumnWidth }[]` |  | Table variant: one header per child field, in order. |
| `validators` | `BindValidators<ValuesOf<A>, DeepValue<ValuesOf<A>, N & DeepKeys<ValuesOf<A>>>>` |  | Array-level validators (`minItems`, `unique`…); their errors render as the group's error. |
| `children` (required) | `(item: RepeaterItem<ItemOf<ValuesOf<A>, N>, RegistryOf<A>>) => ReactNode` |  |  |

`RepeaterItem`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` (required) | `number` |  |  |
| `count` (required) | `number` |  |  |
| `key` (required) | `string` |  | Stable React key (items are keyed by index). |
| `name` (required) | `string` |  | TanStack path of the item, e.g. `guests[2]`. |
| `fields` (required) | `BoundFields<I, R>` |  | Item-relative typed shorthand: `item.fields.TextField name="first"` binds `guests[2].first`. |
| `remove` (required) | `() => void` |  |  |
| `move` (required) | `(to: number) => void` |  |  |
| `canRemove` (required) | `boolean` |  |  |
| `canMoveUp` (required) | `boolean` |  |  |
| `canMoveDown` (required) | `boolean` |  |  |
