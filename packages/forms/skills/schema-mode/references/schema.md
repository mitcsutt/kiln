<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Overview

> The shape of a form schema, how it renders, and what stays out of the JSON.

Source: https://kiln.mitchellsutton.com/docs/forms/schema

A form schema is a JSON object with a `version` and a `root` node. Every node is one of five kinds:

| Node     | Looks like                                    | Renders                                              |
| -------- | --------------------------------------------- | ---------------------------------------------------- |
| Field    | `{ "kind": "text", "name": "email", … }`      | the registered field for that kind                   |
| Layout   | `{ "layout": "grid", "children": [ … ] }`     | a forms layout, or kiln-ui's `Stack` and `Inline`    |
| Repeater | `{ "layout": "repeater", "name": "legs", … }` | a `Repeater`, with `item` nodes for each item        |
| Content  | `{ "content": "heading", "text": "…" }`       | a heading, text, alert, divider, or a form component |
| Custom   | `{ "custom": "notice", "props": { … } }`      | a component you registered                           |

Any node can take an `id` (for [`SchemaNode`](../SKILL.md#rendering-part-of-a-schema)) and a `when` condition.

```json
{
  "version": 1,
  "title": "Lost property",
  "root": {
    "layout": "stack",
    "children": [
      {
        "kind": "text",
        "name": "item",
        "label": "What did you lose?",
        "rules": [{ "rule": "required" }]
      },
      { "content": "submit", "label": "Send report" }
    ]
  }
}
```

## Parity with component mode

Everything component mode can do has a schema form, and the two render the same markup:

| Component mode                                              | Schema mode                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `<form.XField name …/>`                                     | `{ "kind": "x", "name": … }`                                               |
| field `validators`, `warn`                                  | `rules`, `warnRules`                                                       |
| `disabled`, `readOnly`, `excluded`, `required`              | the same, or `disabledWhen`, `readOnlyWhen`, `excludeWhen`, `requiredWhen` |
| a listener that resets another field                        | `resets`                                                                   |
| `derive` on `useAppForm`                                    | `compute`                                                                  |
| `loadOptions` and `reloadOn`                                | `optionsFrom: { loader, deps }`                                            |
| `<When>`                                                    | `when`                                                                     |
| every layout                                                | `layout: "grid" \| "section" \| "tabs" \| …`                               |
| `SubmitButton`, `ResetButton`, `ErrorSummary`, `FormStatus` | `{ "content": "submit" \| "reset" \| "errorSummary" \| "status" }`         |
| a component of your own                                     | `{ "custom": key, "props": … }`                                            |

## Functions stay out of the JSON

A schema is plain JSON, so it can be stored, sent and diffed. Anything that needs code (an options loader, a custom validator, a computed value, a custom node or layout) is registered with the kit and referenced by key. See [Registries](./registries.md).

A schema that only uses registry keys round-trips through `JSON.stringify` and `JSON.parse` unchanged.

## Not JSON Schema

kiln-forms schemas aren't JSON Schema, and don't import or export it: conditions, layout and repeater templates have no faithful JSON Schema form. To share validation between client and server, use [`toStandardSchema`](./server-validation.md).
