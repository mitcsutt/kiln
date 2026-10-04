---
name: component-mode
description: "Use when building a form in React with @mitcsutt/kiln-forms in JSX: installing it, useAppForm, form.AppField and the typed form.<Kind>Field components, default values, onSubmit, layouts like FormSection, FormSteps, FormTabs and Repeater, conditional fields with When, and submit buttons."
metadata:
  purpose: Build typed forms with useAppForm, where each field is bound to a path of the values and rendered through kiln-ui.
  type: core
  library: "@mitcsutt/kiln-forms"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/forms/index.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/getting-started/component-mode.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/getting-started/account-settings.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/getting-started/onboarding.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/getting-started/savings-goal.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/layouts/form.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/layouts/form-section.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/layouts/form-grid.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/layouts/form-steps.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/layouts/form-tabs.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/layouts/repeater.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/layouts/when.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/layouts/submit-button.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/hooks/use-field-value.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/hooks/use-form-status.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/hooks/use-unsaved-changes.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Write a form in component mode

Build typed forms with useAppForm, where each field is bound to a path of the values and rendered through kiln-ui.

## Overview

Typed React forms on TanStack Form, written as components or described as JSON, rendered entirely through kiln-ui.

`@mitcsutt/kiln-forms` handles form state, validation, submission and accessibility, and renders nothing of its own: every field is a kiln-ui `*Field`, and every layout is built from kiln-ui primitives. A form looks exactly like the same fields would without it.

```tsx
import { ErrorSummary, Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Alert, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.email('Enter an email address like ines@example.com'),
  ticket: z.enum(['single', 'return', 'day']),
})

export default function FirstForm() {
  const [booked, setBooked] = useState<string | null>(null)
  const form = useAppForm({
    defaultValues: { name: '', email: '', ticket: 'return' },
    schema,
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setBooked(value.email)
    },
  })
  return (
    <Form form={form} aria-label="Book a ferry ticket">
      <Stack gap={5}>
                <form.TextField name="name" label="Full name" autoComplete="name" required />
        <form.TextField name="email" label="Email" type="email" autoComplete="email" required />
        <form.SegmentedField
          name="ticket"
          label="Ticket"
          options={[
            { value: 'single', label: 'Single' },
            { value: 'return', label: 'Return' },
            { value: 'day', label: 'Day pass' },
          ]}
        />
        <SubmitButton>Book ticket</SubmitButton>
        {booked ? (
          <Alert tone="positive" title="Booked">
            Your ticket is on its way to {booked}.
          </Alert>
        ) : null}
      </Stack>
    </Form>
  )
}
```

Submit it empty to see the error summary, then fix the fields: errors appear after you leave a field or try to submit, and stay live while you fix them.

### Install

```sh
pnpm add @mitcsutt/kiln-forms @mitcsutt/kiln-ui
```

kiln-ui, React and React DOM (18.3 or 19) are peer dependencies, so your app has one copy of the UI. The package ships no CSS: load kiln-ui's stylesheet once, as in [UI, getting started](https://kiln.mitchellsutton.com/docs/ui). The only runtime dependency is `@tanstack/react-form`, which you never import yourself.

### Two ways to write a form

Both use the same fields, layouts, validation and accessibility, so you can mix them on one page.

- **[Component mode](#)**: `useAppForm` returns a form whose fields (`form.TextField`, `form.AmountField`) are typed against your values. A text field can't be bound to a number.
- **[Schema mode](https://kiln.mitchellsutton.com/docs/forms/getting-started/schema-mode)**: describe the form as JSON and render it with `SchemaForm`. Schemas can come from a server or a CMS, and the React-free `@mitcsutt/kiln-forms/schema` entry runs the same rules on your server.

### What it decides for you

- **Error timing.** A field's error shows after it's been left or after a submit attempt, then stays live while it's being fixed ("reward early, punish late").
- **Errors and warnings.** Errors block submission; warnings are advice that never does.
- **Submitting.** The submit button is never `disabled`: it's `aria-disabled` with a reason, so everyone can reach it and hear why. An invalid submit focuses the error summary, or the first invalid field after revealing its tab, accordion item or step.
- **The payload.** Hidden fields go back to their defaults before `onSubmit` sees the values, so a branch the reader didn't take never leaks into what you save.
- **Performance.** Only the field being edited re-renders on a keystroke.

### Names

Bound fields are exported with a `Form` prefix (`FormTextField`, `FormAmountField`), so they never share a name with kiln-ui's unbound controls (`TextField`). Inside a form you'll mostly use the shorthand on the form object, `form.TextField`, which is the same component.

### Where next

- [Fields](https://kiln.mitchellsutton.com/docs/forms/fields/text-field): all 28, with the value each one holds.
- [Layouts](references/form.md): sections, tabs, steps, repeaters and more.
- [Validation](https://kiln.mitchellsutton.com/docs/forms/getting-started/validation): schemas, field rules, warnings and server errors.

## Component mode

Write a form as JSX with useAppForm. Field names are type-checked against your values, and each field binds only to paths of the right type.

In component mode, `useAppForm` takes your default values and returns a form object. The form object carries a bound component for every field kind (`form.TextField`, `form.NumberField`, `form.SelectField`), each typed against your values.

```tsx
import { Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'

const form = useAppForm({
  defaultValues: { name: '', seats: null as number | null },
  onSubmit: async ({ value }) => save(value),
})

<Form form={form} aria-label="Book seats">
  <form.TextField name="name" label="Full name" />
  <form.NumberField name="seats" label="Seats" min={1} />
  <SubmitButton>Book</SubmitButton>
</Form>
```

### Types do the checking

`name` only accepts paths whose value the field can hold:

| Binding                                                     | Result                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `form.TextField` to `name: string` or `address.city`        | fine                                                       |
| `form.TextField` to `seats: number \| null`                 | a type error                                               |
| `form.TextField` to `role: 'admin' \| 'member'`             | a type error: a text box would write any string            |
| `form.NumberField` to `seats: number \| null`               | fine (clearing it writes `null`)                           |
| `form.SelectField` to `role` with an option `value: 'root'` | a type error: option values are typed to the union         |
| `form.CheckboxGroupField` to `days: ('mon' \| 'tue')[]`     | fine, and each option's `value` must be `'mon'` or `'tue'` |

Model a number that can be empty as `number | null`: empty number fields write `null`, never `NaN` or `''`.

### The `Form` element

`<Form form={form}>` renders a `<form noValidate>` wired to the kit: submitting runs validation and your `onSubmit`, repeated submits are ignored while one is in flight, and a reset button resets the form. Give it an accessible name (`aria-label`, or `aria-labelledby` pointing at a heading). `mode="view"` turns every field into read-only text; `disabled` and `readOnly` cascade to every field.

### The TanStack way still works

`form` _is_ TanStack Form's form API, so everything from TanStack works: `form.AppField` with a render prop, `form.Subscribe`, `form.store`, `form.setFieldValue`. The bound shorthand is a convenience over `AppField`, not a replacement.

```tsx
import { Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export default function Canonical() {
  const form = useAppForm({ defaultValues: { reference: '' } })
  return (
    <Form form={form} aria-label="Find a booking">
      <Stack gap={5}>
        <form.AppField
          name="reference"
          validators={{
            onBlur: ({ value }) =>
              /^BAY-\w{3}$/.test(value) ? undefined : 'References look like BAY-40Q',
          }}
        >
          {(field) => <field.TextField label="Booking reference" required />}
        </form.AppField>
        <SubmitButton>Find booking</SubmitButton>
      </Stack>
    </Form>
  )
}
```

Inside `AppField`, `field.TextField` isn't checked against the value type (TanStack can't do it there); a development-only guard catches a mismatch at runtime instead.

### Splitting a big form

`withForm` makes a component out of part of a form, typed against the same values. Share the options between the form and its pieces with `formOptions`.

```tsx
import {
  Form,
  FormSection,
  SubmitButton,
  formOptions,
  useAppForm,
  withForm,
} from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const passengerOptions = formOptions({
  defaultValues: { name: '', email: '', phone: '' },
})

// A piece of a bigger form, typed against the same values.
const ContactDetails = withForm({
  ...passengerOptions,
  props: { title: 'Contact details' },
  render: function ContactDetails({ form, title }) {
    return (
      <FormSection title={title}>
        <form.TextField name="name" label="Full name" autoComplete="name" />
        <form.TextField name="email" label="Email" type="email" autoComplete="email" />
        <form.TextField name="phone" label="Mobile" type="tel" autoComplete="tel" optional />
      </FormSection>
    )
  },
})

export default function WithForm() {
  const form = useAppForm(passengerOptions)
  return (
    <Form form={form} aria-label="Passenger">
      <Stack gap={5}>
                <SubmitButton>Continue</SubmitButton>
      </Stack>
    </Form>
  )
}
```

### Reusable groups of fields

`withFieldGroup` makes a group of fields that binds wherever a form has the right shape, and `useFields(group)` gives typed shorthand inside it. Bind the group with `fields="password"`: TypeScript checks that `password` has the group's shape.

```tsx
import { Form, SubmitButton, useAppForm, useFields, withFieldGroup } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

// One reusable pair of fields, bound wherever a form has `{ next, confirm }`.
const NewPassword = withFieldGroup({
  defaultValues: { next: '', confirm: '' },
  render: function NewPassword({ group }) {
    const fields = useFields(group)
    return (
      <>
        <fields.PasswordField
          name="next"
          label="New password"
          autoComplete="new-password"
          validators={{
            onDynamic: ({ value }) =>
              value.length < 12 ? 'Use at least 12 characters' : undefined,
          }}
        />
        <fields.PasswordField
          name="confirm"
          label="Type it again"
          autoComplete="new-password"
          validators={{
            onChangeListenTo: ['next'],
            onDynamic: ({ value }) =>
              value === group.getFieldValue('next') ? undefined : "The two passwords don't match",
          }}
        />
      </>
    )
  },
})

export default function FieldGroup() {
  const form = useAppForm({ defaultValues: { password: { next: '', confirm: '' } } })
  return (
    <Form form={form} aria-label="Change password">
      <Stack gap={5}>
                <SubmitButton>Change password</SubmitButton>
      </Stack>
    </Form>
  )
}
```

```ts
useFields<A extends { AppField: unknown; state: { values: unknown; }; }>(api: A) => BoundFields<ValuesOf<A>, { text: FieldDef<ExactContract<string>, FormTextFieldProps>; textarea: FieldDef<ExactContract<string>, FormTextareaFieldProps>; select: FieldDef<OptionContract<Primitive>, FormSelectFieldProps>; checkbox: FieldDef<ExactContract<boolean>, FormCheckboxFieldProps>; date: FieldDef<ExactContract<string>, FormDateFieldProps>; time: FieldDef<ExactContract<string>, FormTimeFieldProps>; dateTime: FieldDef<ExactContract<string>, FormDateTimeFieldProps>; hidden: FieldDef<ExactContract<string>, FormHiddenFieldProps>; password: FieldDef<ExactContract<string>, FormPasswordFieldProps>; number: FieldDef<ExactContract<number>, FormNumberFieldProps>; amount: FieldDef<ExactContract<number>, FormAmountFieldProps>; oneTimeCode: FieldDef<ExactContract<string>, FormOneTimeCodeFieldProps>; color: FieldDef<ExactContract<string>, FormColorFieldProps>; switch: FieldDef<ExactContract<boolean>, FormSwitchFieldProps>; dateRange: FieldDef<ExactContract<DateRangeValue>, FormDateRangeFieldProps>; radio: FieldDef<OptionContract<Primitive>, FormRadioFieldProps>; segmented: FieldDef<OptionContract<SegmentedValue>, FormSegmentedFieldProps>; choiceCards: FieldDef<OptionContract<ChoiceCardValue>, FormChoiceCardsFieldProps>; multiChoiceCards: FieldDef<OptionsContract<MultiChoiceCardValue>, FormMultiChoiceCardsFieldProps>; checkboxGroup: FieldDef<OptionsContract<CheckboxGroupValue>, FormCheckboxGroupFieldProps>; chips: FieldDef<OptionsContract<ChipsValue>, FormChipsFieldProps>; slider: FieldDef<ExactContract<number>, FormSliderFieldProps>; range: FieldDef<ExactContract<[number, number]>, FormRangeFieldProps>; rating: FieldDef<ExactContract<number>, FormRatingFieldProps>; combobox: FieldDef<OptionContract<ComboboxValue>, FormComboboxFieldProps>; multiSelect: FieldDef<OptionsContract<MultiSelectValue>, FormMultiSelectFieldProps>; tags: FieldDef<ExactContract<readonly string[]>, FormTagsFieldProps>; file: FieldDef<ExactContract<readonly FileValue[]>, FormFileFieldProps>; }>
```

### useAppForm options

Beyond `defaultValues` and `onSubmit`, the options you'll reach for most:

- `schema`: a Standard Schema (zod, valibot, arktype) for the whole form. `onSubmit` receives its parsed `output` as well as `value`. See [Validation](https://kiln.mitchellsutton.com/docs/forms/getting-started/validation).
- `validateOn`: when validation first runs, `'blur'` (the default), `'change'` or `'submit'`. After a field's first blur, or any submit, it's always live.
- `errorVisibility`: when errors show. The default shows them once a field is left or after a submit.
- `afterSubmit`: `'rebaseline'` (the default: the submitted values become the new clean state), `'reset'`, `'keep'` or `'lock'` (the submit button stays locked until a reset, for dialogs).
- `focusOnInvalid`: where focus goes on an invalid submit. `'auto'` is the error summary if one is mounted, else the first invalid field.
- `derive`: fields computed from other fields. See [Savings goal](references/savings-goal.md).
- `messages`: replace any of the library's text, from "Saving…" to the error summary's title.

`KitFormOptions`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultValues` (required) | `T` |  |  |
| `schema` | `StandardSchemaV1<NoInfer<T>, O>` |  | Whole-form Standard Schema. Its input must be assignable to T; `output` in onSubmit is its output. |
| `schemaAsync` | `true` |  | The schema validates asynchronously: run it in the async dynamic slot. |
| `validateOn` | `'submit' \| 'blur' \| 'change'` |  | When validation first runs. After a field's first blur (or any submit) it is always live. Default 'blur'. |
| `errorVisibility` | `ErrorVisibility` |  | When errors become visible. Default 'blur' = isBlurred \|\| submitted. |
| `validators` | `KitFormValidators<NoInfer<T>>` |  |  |
| `listeners` | `KitFormListeners` |  |  |
| `derive` | `readonly DeriveRule<NoInfer<T>>[]` |  | Derived fields: recompute `field` from other fields (§6.9). |
| `onSubmitMeta` | `M` |  |  |
| `onSubmit` | `((ctx: { value: NoInfer<T>; output: NoInfer<O>; formApi: AnyFormApi; meta: NoInfer<M>; }) => unknown)` |  |  |
| `onSubmitError` | `(ctx: { error: unknown; formApi: AnyFormApi }) => void` |  | Called for non-FormSubmitError throws. Default: console.error + form-level `messages.submitFailed`. |
| `onSubmitInvalid` | `((ctx: { value: NoInfer<T>; formApi: AnyFormApi; }) => void)` |  | Runs after the kit's focus handling. |
| `afterSubmit` | `'reset' \| 'rebaseline' \| 'keep' \| 'lock'` |  | After a successful submit. Default 'rebaseline' (submitted values become the new defaults → clean). |
| `focusOnInvalid` | `'auto' \| 'summary' \| 'first-field' \| false` |  | Default 'auto' = the ErrorSummary if one is mounted, else the first invalid field. |
| `formatError` | `(error: NormalisedError) => string` |  |  |
| `messages` | `Partial<FormMessages>` |  |  |
| `validationLogic` | `ValidationLogicFn` |  | An explicit TanStack validation logic (e.g. `revalidateLogic()`); inactive gating still wraps it. |
| `formId` | `string` |  |  |
| `asyncAlways` | `boolean` |  |  |
| `asyncDebounceMs` | `number` |  |  |
| `canSubmitWhenInvalid` | `boolean` | `true` | Default `true` in the kit: every submit validates every field (so all errors show at once). |
| `transform` | `AnyFormOptions['transform']` |  |  |
| `defaultState` | `AnyFormOptions['defaultState']` |  |  |

## References

Read a reference when its description matches the task:

- [Account settings](references/account-settings.md): A settings page that saves as you type, with sections in a label column and the password in a form of its own.
- [Onboarding](references/onboarding.md): A multi-step application with a branch that only some people see, and a review step built from the same fields.
- [Savings goal](references/savings-goal.md): A form written as a sentence, with a value computed from the others as you type.
- [Form](references/form.md): The form element, wired to the kit. Submitting runs validation and your onSubmit; disabled, readOnly and view mode cascade to every field.
- [FormSection](references/form-section.md): A titled group of fields, as a fieldset and legend, that can be disabled or made read-only as one.
- [FormGrid](references/form-grid.md): Fields in columns that collapse on small screens, with items that span.
- [FormSteps](references/form-steps.md): A form split into steps, validated one step at a time, with focus and announcements handled.
- [FormTabs](references/form-tabs.md): Fields split across tabs, with an error count on each tab and every field kept mounted.
- [Repeater](references/repeater.md): A list of repeated groups of fields, as a list, cards or a table, with add, remove and reorder.
- [When](references/when.md): Shows fields only when a condition holds. Hidden fields stop validating and are reset in what's submitted.
- [SubmitButton](references/submit-button.md): Submits the form. Never disabled, so everyone can reach it and hear why it's waiting.
- [useFieldValue](references/use-field-value.md): One value from the form, for rendering that depends on it, re-rendering only when it changes.
- [useFormStatus](references/use-form-status.md): The form's state at a glance (dirty, submitting, submitted, valid), re-rendering only when a part of it changes.
- [useUnsavedChanges](references/use-unsaved-changes.md): Ask before the reader leaves a form with unsaved changes, and tell your router the same.
