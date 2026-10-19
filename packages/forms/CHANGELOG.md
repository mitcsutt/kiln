# @mitcsutt/kiln-forms

## 0.2.0

### Minor Changes

- 6e77724: `Repeater` can reorder its items by dragging. `reorderable="drag"` (or `"reorderable": "drag"` in a schema) adds a drag handle to each item, beside its Move up and Move down buttons, that moves the item by pointer, touch or keyboard: Space or Enter picks it up, the arrow keys move it, Space or Enter drops it and Escape puts it back, and each step is announced. The item's values, errors and touched state move with it, and keyboard focus stays on its handle. Drag and drop comes from the new `@mitcsutt/kiln-forms/dnd` entry, built on `@mitcsutt/kiln-dnd`, an optional peer dependency: install it, import `@mitcsutt/kiln-dnd/styles.css` after kiln-ui's stylesheet, and give your kit its `dragAndDrop` with `kit.extend({ dragAndDrop })`. Without it, those repeaters show the move buttons alone. The words come from a new `drag` group in `FormMessages`. Repeaters without `"drag"`, and forms that never import the entry, don't change.
- 464d91b: Add `FormJsonField` (kind `json`), a JSON editor on kiln-ui's `JsonField` that binds the JSON text, refuses to submit text that doesn't parse (with the line and column, from `messages.invalidJson`), runs an optional `validate` on the parsed value, and shows the JSON formatted with a copy button in view mode. `toStandardSchema` runs the same check on a server. Custom fields can do the same with the new `check` option of `useFieldBinding`.

  Options can carry a `swatch`, a categorical slot or a CSS colour: chips and segmented draw it before the label, and the tags chips, checkbox group and multi choice cards show in view mode carry it. `parseFormSchema` accepts only a slot or a plain colour from a schema, and the renderer drops any other.

- 250f10a: Add `animate` to `When`: the fields it shows grow into place and shrink away before they unmount (its `fallback` the other way round), with kiln-ui's `Collapse`. Schema nodes take `"whenAnimate": true` for the same. Hidden fields are pruned and stop validating exactly as before.

  Add `viewLines` to `Form`, `FormReview` and `FieldPresentation` (and the schema `review` layout): in view mode each value is clamped to about that many lines with a "Show more" toggle, from kiln-ui's `ShowMore`. The toggle's text comes from the new `messages.showMore` and `messages.showLess`.

  Both are off by default, so existing forms render as they did. The `Form` docs page also gains a "Toast on submit" example that raises kiln-ui toasts from `onSubmit` and `onSubmitError`.

- 183e796: `FormDateField`, `FormTimeField` and `FormDateTimeField` take an opt-in `picker` prop (and the same key in a schema) that renders kiln-ui's typed date and time controls in place of the native input: `picker="calendar"` for `DateField` or `DateTimeField` with a calendar to pick from, and `picker="segmented"` for the typed parts alone (the only picker for a time). With a picker they also take `isDateDisabled`, `firstDayOfWeek`, `locale`, `clearable` and `labels`, plus `timeZone` on a date and `granularity` and `hourCycle` on a time or date-time. Without `picker` nothing changes, and the value is the same ISO string either way. `FormDateRangeField` takes `picker="calendar"` too (and turns it on by itself for `presets` or a time `granularity`), rendering kiln-ui's `DateRangePickerField` with every one of its props; its view mode now reads an end with a time as a date and time (on the field's `timeZone` for an instant) instead of showing the raw ISO string.

  In view mode, all four fields now read the value in the field's `locale`, and on its `hourCycle` for a time, when you set them, so reading matches editing. Without them, view mode reads exactly as before.

## 0.1.6

### Patch Changes

- 4c53011: The `setup-and-theming` and `component-mode` skills link to the new AI tooling page on the docs site.

## 0.1.5

### Patch Changes

- ad8ad08: Tidy doc comments and the shipped agent skills: the `setup-and-theming` skill's storage key example uses a generic app name, and comments no longer refer to internal planning documents.

## 0.1.4

### Patch Changes

- 1ef6bf4: Each field's, layout's and hook's doc comment is now the text of its docs page: the summary is the page's description, `@remarks` its lead, `@value` and `@empty` a field's value and empty value, and `@example In a schema` its schema node. Design-document references moved to `@privateRemarks`. The agent skills follow the regenerated pages.

## 0.1.3

### Patch Changes

- 4834a79: The agent skills' examples now declare each example as a named export (`export function Usage()`) instead of a default export, matching the docs, where the examples now sit beside the code they document. The examples are otherwise unchanged.

## 0.1.2

### Patch Changes

- b914595: Fewer re-renders. Hiding a `When`, a field becoming disabled, read-only or excluded, or an autosave status no longer re-renders every `SubmitButton`, `FormStatus`, tab or accordion error badge and step panel; each re-renders only when what it shows changes. The typed-shorthand fields (`form.TextField`, a Repeater's `item.fields.TextField`) are memoised, so a re-render of the component that owns the form (for example `useAutosave`'s saving and saved states) or adding a Repeater row no longer re-renders fields whose props didn't change. Typing in a field no longer re-registers it with the form on every keystroke.
- b914595: `useServerValues` keeps an error across a refresh only on a value the refresh left alone. A field that takes a new server value no longer shows the error its old value had. Kept errors now stay visible under every `errorVisibility` policy (with `'submit'`, the refresh used to hide them) and one that a submit or a step's Next had quieted isn't announced again as an alert.
- b914595: The package's source is reorganised like `@mitcsutt/kiln-ui`'s (components grouped under `components/`, hooks in `hooks/`). The public exports from `@mitcsutt/kiln-forms` and `@mitcsutt/kiln-forms/schema` are unchanged; only the file paths inside `dist/` moved, and they can't be imported directly.

## 0.1.1

### Patch Changes

- b14cd6e: The README's agent-skills section now covers projects that already have an `intent.skills` list in `package.json`: add the package to the list, then check with `npx @tanstack/intent@latest list`.
