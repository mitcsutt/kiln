---
'@mitcsutt/kiln-forms': minor
---

Add `animate` to `When`: the fields it shows grow into place and shrink away before they unmount (its `fallback` the other way round), with kiln-ui's `Collapse`. Schema nodes take `"whenAnimate": true` for the same. Hidden fields are pruned and stop validating exactly as before.

Add `viewLines` to `Form`, `FormReview` and `FieldPresentation` (and the schema `review` layout): in view mode each value is clamped to about that many lines with a "Show more" toggle, from kiln-ui's `ShowMore`. The toggle's text comes from the new `messages.showMore` and `messages.showLess`.

Both are off by default, so existing forms render as they did. The `Form` docs page also gains a "Toast on submit" example that raises kiln-ui toasts from `onSubmit` and `onSubmitError`.
