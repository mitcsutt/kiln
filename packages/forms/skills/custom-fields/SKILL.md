---
name: custom-fields
description: "Use when a form built with @mitcsutt/kiln-forms needs a field it does not ship: defineField, defineOptionField or defineOptionsField, binding a control with useFieldBinding, view mode with FieldView, registering the field with kit.extend or createFormKit, and using it as form.<Kind>Field and { kind } in schemas."
metadata:
  purpose: Build a field once and register it with the kit, so it works in component mode, schema mode and view mode with types.
  type: core
  library: "@mitcsutt/kiln-forms"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/forms/getting-started/custom-fields.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/layouts/custom-layouts.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/registries.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Add a custom field

Build a field once and register it with the kit, so it works in component mode, schema mode and view mode with types.

A field is a small component: it binds one kiln-ui `*Field` (or any control) to form state through `useFieldBinding`, which owns the ids, error timing, warnings, disabled and read-only behaviour, focus and view mode. Register it with the kit, and it's available as `form.<Kind>Field` and as `{ kind }` in schemas, with types.

```tsx
import {
  accepts,
  defineField,
  FieldView,
  Form,
  kit,
  SubmitButton,
  useFieldBinding,
  type CommonFieldProps,
} from '@mitcsutt/kiln-forms'
import { Stack, TextField, type TextFieldProps } from '@mitcsutt/kiln-ui'

type PhoneFieldProps = Omit<TextFieldProps, 'value' | 'defaultValue' | 'onValueChange' | 'type'> &
  CommonFieldProps<string>

/** A UK mobile number, stored as digits only: a field this app needs and Kiln doesn't ship. */
const PhoneField = defineField<string>()(function PhoneField({
  warn,
  excluded,
  ...props
}: PhoneFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view') {
    return (
      <FieldView label={props.label}>{binding.value ? `+44 ${binding.value}` : null}</FieldView>
    )
  }
  return (
    <TextField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      type="tel"
      autoComplete="tel-national"
      leading="+44"
      value={binding.value}
      onValueChange={(next) => {
        binding.setValue(next.replace(/\D/g, ''))
      }}
      onBlur={binding.onBlur}
    />
  )
})

// Register it once, in a module of your own: `phone` becomes form.PhoneField, field.PhoneField
// and { kind: 'phone' } in schemas. Import useAppForm from that module from then on.
const { useAppForm } = kit.extend({ fields: { phone: PhoneField } })

export default function CustomField() {
  const form = useAppForm({ defaultValues: { mobile: '' } })
  return (
    <Form form={form} aria-label="Text me updates">
      <Stack gap={5}>
        <form.PhoneField
          name="mobile"
          label="Mobile number"
          description="We'll text you if your sailing is delayed"
          validators={{
            onDynamic: ({ value }) =>
              value.length === 10 ? undefined : 'Enter the 10 digits after +44',
          }}
        />
        <SubmitButton>Save number</SubmitButton>
      </Stack>
    </Form>
  )
}
```

## 1. Declare what it holds

Wrap the component in a define helper. The contract decides which paths the field can bind to:

- `defineField<V>()` for a field that holds exactly `V` (a string, a number, an object).
- `defineOptionField<B>()` for one choice from options, keeping the bound path's own type.
- `defineOptionsField<B>()` for several choices, bound to an array.

The helpers do nothing at runtime; they only carry the type.

## 2. Bind it

Call `useFieldBinding` with the field's props, a runtime guard (`accepts.string`, `accepts.number`…) and the value it writes when cleared (`empty`). Spread `binding.fieldProps` and `binding.ref` onto the kiln-ui field, and wire `value`, `setValue` and `onBlur`.

```ts
useFieldBinding<V>(options: FieldBindingOptions<V>) => FieldBinding<V>
```

THE binding hook (§4): ids, error visibility + normalisation, warnings, disabled/readOnly/excluded
semantics, focus registration and view mode, for the field in context.

Option fields map their values through `useOptionMapping`, so numbers and booleans survive the string-only controls underneath.

```ts
useOptionMapping<V extends Primitive>(options: readonly FieldOption<V>[] | undefined, opts?: OptionMappingOptions<V>) => OptionMapping<V>
```

Hook form of `createOptionMapping`, memoised on the options array and `emptyOption` (and
`retain`/`known` by identity — pass stable references).

## 3. Support view mode

When `binding.mode` is `'view'`, return `<FieldView label={…}>` with the value formatted for reading. Pass `null` or `''` through, and it shows "Not provided". `FieldViewList` is the description list view-mode fields render into.

## 4. Register it

Extend the default kit once, in a module of your own, and import the form hooks from there:

```ts title="src/forms.ts"
import { kit } from '@mitcsutt/kiln-forms'
import { PhoneField } from './PhoneField'

export const { useAppForm, withForm, withFieldGroup, useFields, defineFormSchema, SchemaForm } =
  kit.extend({ fields: { phone: PhoneField } })
```

The kind `phone` becomes `form.PhoneField`, `field.PhoneField` and `{ kind: 'phone' }`. An extended kit can't shadow a kind that already exists. `createFormKit` builds a kit from scratch, for an app that wants only its own fields.

## Inside a field

`useFieldContext()` returns TanStack's field API inside a field component, and `binding.api` is the same thing: the escape hatch when the binding doesn't cover something.

## The rules

From the forms package's authoring guide, and enforced by its tests:

- No CSS in a field. If the control you need doesn't exist, build it in kiln-ui first.
- All text comes from the kit's `messages`, so it can be translated.
- A bound field is named `Form<Kind>Field` when it's exported, so it never collides with a kiln-ui name.

## References

Read a reference when its description matches the task:

- [Custom layouts](references/custom-layouts.md): Write a layout of your own that counts errors, reveals fields on an invalid submit and works in view mode and schema mode.
- [Registries](references/registries.md): Options loaders, custom validators, computed values and custom nodes, registered with the kit and referenced by key.
