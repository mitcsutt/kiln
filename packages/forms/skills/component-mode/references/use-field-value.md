<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# useFieldValue

> One value from the form, for rendering that depends on it, re-rendering only when it changes.

Source: https://kiln.mitchellsutton.com/docs/forms/hooks/use-field-value

`useFieldValue(form, name)` subscribes to one path and returns its value, typed to that path. Use it when one field's label, placeholder or options depend on another's value.

```tsx
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const POSTCODES: Record<string, string> = { GB: 'KB4 2PQ', IE: 'D02 X285' }

export default function Usage() {
  const form = useAppForm({ defaultValues: { country: 'GB', postcode: '' } })
  const country = useFieldValue(form, 'country')
  return (
    <Form form={form} aria-label="Address">
      <Stack gap={5}>
        <form.SelectField
          name="country"
          label="Country"
          options={[
            { value: 'GB', label: 'United Kingdom' },
            { value: 'IE', label: 'Ireland' },
          ]}
          listeners={{
            onChange: () => {
              form.resetField('postcode')
            },
          }}
        />
        <form.TextField
          name="postcode"
          label={country === 'IE' ? 'Eircode' : 'Postcode'}
          placeholder={POSTCODES[country === 'IE' ? 'IE' : 'GB']}
        />
      </Stack>
    </Form>
  )
}
```

To reset a dependent field when its parent changes, use a field listener, as the country field above does with `form.resetField('postcode')`. In schema mode the same thing is `resets: ['postcode']`.

Read values where they're used: a small component that calls `useFieldValue` re-renders alone, while calling it at the top of a big form re-renders the whole form on each change.

```ts
declare function useFieldValue<A extends AnyKitForm, N extends DeepKeys<A['state']['values']>>(form: A, name: N): DeepValue<A['state']['values'], N>
```

One path's value, subscribed with a single selector — for sibling-aware rendering.
Re-renders only when that value changes (`===`).
