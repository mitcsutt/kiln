<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# useFormStatus

> The form's state at a glance (dirty, submitting, submitted, valid), re-rendering only when a part of it changes.

Source: https://kiln.mitchellsutton.com/docs/forms/hooks/use-form-status

`useFormStatus` reads the form-wide state you build interface around: whether it's dirty, submitting or submitted, whether it can submit, and how many times it's been submitted. Each part is its own selector and the result is memoised, so a component using it re-renders only when something it reads actually changes.

```tsx
import { Form, SubmitButton, useAppForm, useFormStatus } from '@mitcsutt/kiln-forms'
import { DataList, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({
    defaultValues: { route: 'Morning commute' },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 1000)),
  })
  const status = useFormStatus(form)
  return (
    <Form form={form} aria-label="Route">
      <Stack gap={5}>
        <form.TextField name="route" label="Route name" />
        <SubmitButton>Save</SubmitButton>
        <DataList>
          <DataList.Item label="Dirty">{String(status.isDirty)}</DataList.Item>
          <DataList.Item label="Submitting">{String(status.isSubmitting)}</DataList.Item>
          <DataList.Item label="Submitted">{String(status.isSubmitted)}</DataList.Item>
          <DataList.Item label="Submit count">{status.submitCount}</DataList.Item>
        </DataList>
      </Stack>
    </Form>
  )
}
```

`isDirty` compares the current values with the baseline (the defaults, or the last saved values), so undoing an edit makes the form clean again. Inside a `Form`, the `form` argument is optional.

## API

```ts
declare function useFormStatus(form?: AnyKitForm | undefined): FormStatusState
```

Form-wide status; each slice is its own primitive selector, the object is memoised (§6.5).

`FormStatusState`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isDirty` (required) | `boolean` |  | `!isDefaultValue` — differs from the baseline (never TanStack's persistent `isDirty`). |
| `isSubmitting` (required) | `boolean` |  |  |
| `isSubmitted` (required) | `boolean` |  |  |
| `isSubmitSuccessful` (required) | `boolean` |  |  |
| `canSubmit` (required) | `boolean` |  | Not submitting/validating, and valid (or never submitted). Ignores `canSubmitWhenInvalid`. |
| `submitCount` (required) | `number` |  |  |
| `isValidating` (required) | `boolean` |  |  |
| `hasErrors` (required) | `boolean` |  |  |
