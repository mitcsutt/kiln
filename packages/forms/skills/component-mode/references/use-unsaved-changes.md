<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# useUnsavedChanges

> Ask before the reader leaves a form with unsaved changes, and tell your router the same.

Source: https://kiln.mitchellsutton.com/docs/forms/hooks/use-unsaved-changes

`useUnsavedChanges(form)` adds a `beforeunload` prompt while the form differs from its baseline, so closing or reloading the tab asks first. It returns whether the form is dirty, so your router's own navigation blocker can use the same answer.

```tsx
import { Form, SubmitButton, useAppForm, useUnsavedChanges } from '@mitcsutt/kiln-forms'
import { Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({
    defaultValues: { note: '' },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 400)),
  })
  // Warns before the tab closes or reloads while there are unsaved changes.
  const dirty = useUnsavedChanges(form)
  return (
    <Form form={form} aria-label="Feedback">
      <Stack gap={5}>
        <form.TextareaField name="note" label="Feedback for the crew" />
        <Text size="sm" tone="muted">
          {dirty ? 'Unsaved: closing this tab will ask first.' : 'Nothing unsaved.'}
        </Text>
        <SubmitButton>Send</SubmitButton>
      </Stack>
    </Form>
  )
}
```

Pass `when: false` to switch the guard off, for example while a save is in flight.

```ts
useUnsavedChanges(form: AnyKitForm, opts?: { when?: boolean | undefined; }) => boolean
```

Guards against leaving with unsaved changes: a `beforeunload` prompt while the form differs
from its baseline. Returns `isDirty` so router blockers can use it too.
