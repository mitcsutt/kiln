<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Nodes

> Field, layout, repeater and custom nodes, and the props each one takes.

Source: https://kiln.mitchellsutton.com/docs/forms/schema/nodes

## Field nodes

A field node is `{ kind, name }` plus the field's own props, as JSON. Props that are functions are dropped, `ReactNode` props become strings, and `className`, `style` and `children` aren't allowed. In a typed schema (`defineFormSchema<T>()`), `name` must be a path the field can hold, and option values are typed to it.

On top of its own props, every field node takes:

- `rules` and `warnRules`: validation, as [rules](./rules.md).
- `defaultValue`: a field-level default.
- `when`, `disabledWhen`, `readOnlyWhen`, `excludeWhen`, `requiredWhen`: [conditions](./conditions.md).
- `whenHidden`: `prune` (the default), `keep` or `reset`, as on [When](https://kiln.mitchellsutton.com/docs/forms/layouts/when).
- `optionsFrom: { loader, deps }`: options from a registered loader, reloaded when `deps` change.
- `resets`: fields to reset when this one changes.
- `compute: { computer, from }`: a value computed from other fields. Computed fields are read-only.

```json
{
  "kind": "select",
  "name": "region",
  "label": "Region",
  "optionsFrom": { "loader": "regions", "deps": ["country"] },
  "requiredWhen": { "field": "country", "op": "eq", "value": "GB" }
}
```

Each field's page shows its node under "In a schema", for example [AmountField](https://kiln.mitchellsutton.com/docs/forms/fields/amount-field).

## Layout nodes

A layout node is `{ layout, children }` plus the layout's JSON-safe props. Compound layouts have a node for each part: `tab` inside `tabs`, `step` inside `steps`, `accordionItem` inside `accordion`, `panel` inside `panels` and `gridItem` inside `grid`.

| Key                          | Component                                                |
| ---------------------------- | -------------------------------------------------------- |
| `grid`, `gridItem`           | [FormGrid](https://kiln.mitchellsutton.com/docs/forms/layouts/form-grid)                |
| `section`                    | [FormSection](https://kiln.mitchellsutton.com/docs/forms/layouts/form-section)          |
| `aside`                      | [FormAside](https://kiln.mitchellsutton.com/docs/forms/layouts/form-aside)              |
| `rows`                       | [FormRows](https://kiln.mitchellsutton.com/docs/forms/layouts/form-rows)                |
| `panels`, `panel`            | [FormPanels](https://kiln.mitchellsutton.com/docs/forms/layouts/form-panels)            |
| `tabs`, `tab`                | [FormTabs](https://kiln.mitchellsutton.com/docs/forms/layouts/form-tabs)                |
| `accordion`, `accordionItem` | [FormAccordion](https://kiln.mitchellsutton.com/docs/forms/layouts/form-accordion)      |
| `steps`, `step`              | [FormSteps](https://kiln.mitchellsutton.com/docs/forms/layouts/form-steps)              |
| `sentence`                   | [FormSentence](https://kiln.mitchellsutton.com/docs/forms/layouts/form-sentence)        |
| `review`                     | [FormReview](https://kiln.mitchellsutton.com/docs/forms/layouts/form-review)            |
| `actions`                    | [FormActions](https://kiln.mitchellsutton.com/docs/forms/layouts/form-actions)          |
| `stack`, `inline`            | [Stack and inline](https://kiln.mitchellsutton.com/docs/forms/layouts/stack-and-inline) |

Tabs, steps and accordion items count errors and validate from a list of names worked out from the schema itself, so a step's validation is complete before its fields have ever been shown.

## Repeater nodes

```json
{
  "layout": "repeater",
  "name": "passengers",
  "label": "Passengers",
  "newItem": { "name": "", "age": null },
  "min": 1,
  "item": [
    { "kind": "text", "name": "name", "label": "Name" },
    { "kind": "number", "name": "age", "label": "Age" }
  ]
}
```

Names in `item` are relative to the item. Conditions, though, always use root paths, even inside an item.

## Content and custom nodes

[Content nodes](./content-nodes.md) render headings, text, alerts, dividers and the form components. Custom nodes render a component you've registered: `{ "custom": "notice", "props": { "text": "…" } }`. See [Registries](./registries.md).
