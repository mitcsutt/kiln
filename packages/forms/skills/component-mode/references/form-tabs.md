<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# FormTabs

> Fields split across tabs, with an error count on each tab and every field kept mounted.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/form-tabs

`FormTabs` splits a form across tabs. Each tab's trigger shows how many errors are inside it, and hidden panels stay mounted, so their fields still validate on submit and keep their values. On an invalid submit, focus goes to the first error, switching to its tab.

```tsx
import {
  ErrorSummary,
  Form,
  FormTab,
  FormTabs,
  SubmitButton,
  useAppForm,
} from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() ? undefined : message),
})

export function Usage() {
  const form = useAppForm({ defaultValues: { name: '', email: '', stop: '', notes: '' } })
  return (
    <Form form={form} aria-label="New member">
      <Stack gap={5}>
        <ErrorSummary />
        <FormTabs label="Member details">
          <FormTab value="person" label="Person">
            <form.TextField name="name" label="Full name" validators={required('Enter a name')} />
            <form.TextField name="email" label="Email" validators={required('Enter an email')} />
          </FormTab>
          <FormTab value="travel" label="Travel">
            <form.TextField
              name="stop"
              label="Home stop"
              validators={required('Enter a home stop')}
            />
            <form.TextareaField name="notes" label="Notes" optional />
          </FormTab>
        </FormTabs>
        <SubmitButton>Add member</SubmitButton>
      </Stack>
    </Form>
  )
}
```

Submit with everything empty: both tabs show a count, and the summary links switch tabs. `label` names the tab list.

## In a schema

```json
{
  "layout": "tabs",
  "label": "Member details",
  "children": [{ "layout": "tab", "value": "person", "label": "Person", "children": [] }]
}
```

## API

`FormTabsProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  | Accessible name of the tablist. |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `variant` | `'underline' \| 'pill'` |  |  |
| `children` (required) | `ReactNode` |  |  |

`FormTabProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `string` |  |  |
| `label` (required) | `ReactNode` |  |  |
| `children` (required) | `ReactNode` |  |  |
| `scopeNames` | `readonly string[]` |  |  |
