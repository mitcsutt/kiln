---
'@mitcsutt/kiln-forms': minor
---

Add `FormJsonField` (kind `json`), a JSON editor on kiln-ui's `JsonField` that binds the JSON text, refuses to submit text that doesn't parse (with the line and column, from `messages.invalidJson`), runs an optional `validate` on the parsed value, and shows the JSON formatted with a copy button in view mode. `toStandardSchema` runs the same check on a server. Custom fields can do the same with the new `check` option of `useFieldBinding`.

Options can carry a `swatch`, a categorical slot or a CSS colour: chips and segmented draw it before the label, and the tags chips, checkbox group and multi choice cards show in view mode carry it. `parseFormSchema` accepts only a slot or a plain colour from a schema, and the renderer drops any other.
