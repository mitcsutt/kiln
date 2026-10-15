---
'@mitcsutt/kiln-ui': minor
---

Add `Swatch`, a small colour mark for who or what something is, and a `swatch` prop on `Badge`, `Tag` and `ToggleChip` that draws it sized to their text. Add `Indicator`, a count or dot pinned to the corner of another element, with its meaning added to that element's accessible description. Add `CopyButton` and the `useClipboard` hook, which copy with a fallback where the Clipboard API is missing and announce the result; `CodeBlock`'s copy button now uses the same hook. Add `JsonInput` and `JsonField`, a JSON editor that highlights with the theme, marks the line with a syntax error, formats or minifies without changing numbers, and takes your own `validate` rules, plus `formatJson`, `minifyJson` and `validateJson` for the same work outside the editor.
