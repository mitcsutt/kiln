<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# SubmitButton

> Submits the form. Never disabled, so everyone can reach it and hear why it's waiting.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/submit-button

`SubmitButton` is a `Button` with `type="submit"` that knows the form's state. It shows a spinner while submitting. It's **never `disabled`**: when it can't act (while submitting, after a locking submit, or with `requireChanges` before anything has changed) it's `aria-disabled`, ignores presses, and carries a visually hidden reason. A disabled button can't be focused, so keyboard and screen reader users would never find out why they can't go on.

```tsx
import { Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({
    defaultValues: { nickname: 'Morning commute' },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 1200)),
  })
  return (
    <Form form={form} aria-label="Route nickname">
      <Stack gap={5}>
        <form.TextField name="nickname" label="Nickname" />
                <SubmitButton requireChanges>Save nickname</SubmitButton>
      </Stack>
    </Form>
  )
}
```

Outside the `<form>` element (in a dialog footer, a sticky header), pass `formId` to submit a form by its id, and `form` to read its state. `submitMeta` passes a value through to `onSubmit` as `meta`, for a form with two submit buttons ("Save draft" and "Publish").

## In a schema

```json
{ "content": "submit", "label": "Book ticket" }
```

## API

`SubmitButtonProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `form` | `AnyKitForm` |  | Defaults to the form in context. Required for a button outside `<Form>`. |
| `formId` | `string` |  | The `id` of the `<Form>` to submit from outside it (native `form` attribute). |
| `requireChanges` | `boolean` |  | Stays `aria-disabled` (with a spoken reason) until something changed. |
| `submitMeta` | `unknown` |  | Meta passed to `onSubmit` for this button (`form.handleSubmit(meta)`). |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |
| `size` | `'sm' \| 'md' \| 'lg'` |  |  |
| `tone` | `'neutral' \| 'accent' \| 'critical'` |  | Colour intent. `critical` is for destructive actions only. |
| `variant` | `'solid' \| 'outline' \| 'ghost'` |  | Visual weight. One `solid` per view is the norm — it *is* the primary action. |
| `leadingIcon` | `ReactNode` |  | Icon before the label. Pass a library icon or any SVG node. |
| `trailingIcon` | `ReactNode` |  | Icon after the label. Not a decorative "→" — only when it adds meaning (e.g. external). |
| `fullWidth` | `boolean` |  | Stretch to the container's width. |

Also accepts every prop of `ButtonHTMLAttributes<HTMLButtonElement>`.
