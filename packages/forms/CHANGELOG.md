# @mitcsutt/kiln-forms

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
