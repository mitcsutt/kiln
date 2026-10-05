---
'@mitcsutt/kiln-forms': patch
---

Fewer re-renders. Hiding a `When`, a field becoming disabled, read-only or excluded, or an autosave status no longer re-renders every `SubmitButton`, `FormStatus`, tab or accordion error badge and step panel; each re-renders only when what it shows changes. The typed-shorthand fields (`form.TextField`, a Repeater's `item.fields.TextField`) are memoised, so a re-render of the component that owns the form (for example `useAutosave`'s saving and saved states) or adding a Repeater row no longer re-renders fields whose props didn't change. Typing in a field no longer re-registers it with the form on every keystroke.
