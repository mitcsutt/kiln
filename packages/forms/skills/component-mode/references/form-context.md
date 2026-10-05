<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Form context

> Reach a form from components nested deep inside it, typed against its values, without passing it down as a prop.

Source: https://kiln.mitchellsutton.com/docs/forms/getting-started/form-context

`<Form form={form}>` puts the form in React context, so any component below it can reach the form without a `form` prop, however deep it sits. `useTypedAppFormContext(options)` returns that form typed against your values, with the same `form.TextField`, `form.state` and `form.Subscribe` you get from `useAppForm`.

```tsx
import {
  Form,
  formOptions,
  FormSection,
  SubmitButton,
  useAppForm,
  useFieldValue,
  useFormStatus,
  useTypedAppFormContext,
} from '@mitcsutt/kiln-forms'
import { Alert, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState, type ReactNode } from 'react'

// Shared by the form and every component that reads it from context.
const bookingOptions = formOptions({
  defaultValues: {
    attendee: { name: '', email: '' },
    session: 'morning',
    seats: 1,
  },
})

// Layout components pass children through and never see the form.
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FormSection title={title}>
      <Stack gap={4}>{children}</Stack>
    </FormSection>
  )
}

// Two levels below the form, with no `form` prop: the options give it the form's type.
function AttendeeFields() {
  const form = useTypedAppFormContext(bookingOptions)
  return (
    <>
      <form.TextField name="attendee.name" label="Full name" autoComplete="name" />
      <form.TextField name="attendee.email" label="Email" type="email" autoComplete="email" />
    </>
  )
}

function SessionFields() {
  const form = useTypedAppFormContext(bookingOptions)
  return (
    <>
      <form.SegmentedField
        name="session"
        label="Session"
        options={[
          { value: 'morning', label: 'Morning' },
          { value: 'afternoon', label: 'Afternoon' },
        ]}
      />
      <form.NumberField name="seats" label="Seats" min={1} max={6} />
    </>
  )
}

// Subscribes to two values, so only this line re-renders as they change.
function Summary() {
  const form = useTypedAppFormContext(bookingOptions)
  const seats = useFieldValue(form, 'seats')
  const session = useFieldValue(form, 'session')
  return (
    <Text aria-live="polite">
      {seats} {seats === 1 ? 'seat' : 'seats'}, {session} session
    </Text>
  )
}

// Form-wide hooks find the form in context by themselves.
function Footer() {
  const { isDirty } = useFormStatus()
  return (
    <Inline gap={4} align="center">
      <SubmitButton>Book</SubmitButton>
      {isDirty ? <Text tone="muted">Not booked yet</Text> : null}
    </Inline>
  )
}

export function Usage() {
  const [booked, setBooked] = useState<string | null>(null)
  const form = useAppForm({
    ...bookingOptions,
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setBooked(value.attendee.email)
    },
  })
  return (
    <Form form={form} aria-label="Book a workshop">
      <Stack gap={5}>
        <Panel title="Attendee">
          <AttendeeFields />
        </Panel>
        <Panel title="Session">
          <SessionFields />
          <Summary />
        </Panel>
        <Footer />
        {booked ? (
          <Alert tone="positive" title="Booked">
            Your confirmation is on its way to {booked}.
          </Alert>
        ) : null}
      </Stack>
    </Form>
  )
}
```

Nothing between the form and its fields passes `form` down. `AttendeeFields` and `SessionFields` render bound fields, `Summary` reads two values, and `Footer` reads the form's status.

## Typing the form from context

Context can't carry a type, so `useTypedAppFormContext` takes the form's options to get one back. Create them once with `formOptions`, spread them into `useAppForm`, and pass the same object to every component that reads the form from context:

```tsx
import { formOptions, useTypedAppFormContext } from '@mitcsutt/kiln-forms'

export const bookingOptions = formOptions({
  defaultValues: { attendee: { name: '', email: '' }, seats: 1 },
})

export function SeatsField() {
  const form = useTypedAppFormContext(bookingOptions)
  return <form.NumberField name="seats" label="Seats" />
}
```

The options are only read for their type, so a nested component can pass them without an `onSubmit`. Field names are checked as they are on the form itself: `name="seat"` or a `NumberField` on a text path is a type error.

`useTypedAppFormContext` trusts that the form in context was made from those options, just as `withForm` trusts the `form` you pass it. Share one options object per form so they can't drift apart.

## Reading values and state

Subscribe where a value is used, so only that component re-renders when it changes:

- `useFieldValue(form, 'seats')` returns one value, typed to its path.
- `useFormStatus()` returns `isDirty`, `isSubmitting`, `canSubmit` and the rest. It finds the form in context by itself, so it needs no options.
- `form.Subscribe` and `useSelector(form.store, selector)` read any other slice of form state.

`SubmitButton`, `ResetButton`, `ErrorSummary` and `FormStatus` read the form from context too, so they work at any depth.

## Context, a prop, or withForm

- **Context** (`useTypedAppFormContext`) suits components several levels down, and layout components that shouldn't know about the form.
- **A prop** (`withForm`) suits a section one level below the form. The parent passes `form={form}`, and TypeScript checks it has the right shape. See [Component mode](../SKILL.md#splitting-a-big-form).
- **A field group** (`withFieldGroup`) suits a set of fields reused under different paths, like a billing and a delivery address.

## Outside a form

Both context hooks throw outside `<Form>` or `<form.AppForm>`, with an error that says so. `<form.AppForm>` provides the same context without rendering a `<form>` element, for a component that renders fields outside one. `useFormContext()` returns the form untyped, for code that works with any form, such as a [custom layout](https://kiln.mitchellsutton.com/docs/forms/layouts/custom-layouts).

```ts
declare function useTypedAppFormContext<T, O = T, M = undefined>(options: KitFormOptions<T, O, M>): KitForm<T, M, { text: FieldDef<ExactContract<string>, FormTextFieldProps>; textarea: FieldDef<ExactContract<string>, FormTextareaFieldProps>; select: FieldDef<OptionContract<Primitive>, FormSelectFieldProps>; checkbox: FieldDef<ExactContract<boolean>, FormCheckboxFieldProps>; date: FieldDef<ExactContract<string>, FormDateFieldProps>; time: FieldDef<ExactContract<string>, FormTimeFieldProps>; dateTime: FieldDef<ExactContract<string>, FormDateTimeFieldProps>; hidden: FieldDef<ExactContract<string>, FormHiddenFieldProps>; password: FieldDef<ExactContract<string>, FormPasswordFieldProps>; number: FieldDef<ExactContract<number>, FormNumberFieldProps>; amount: FieldDef<ExactContract<number>, FormAmountFieldProps>; oneTimeCode: FieldDef<ExactContract<string>, FormOneTimeCodeFieldProps>; color: FieldDef<ExactContract<string>, FormColorFieldProps>; switch: FieldDef<ExactContract<boolean>, FormSwitchFieldProps>; dateRange: FieldDef<ExactContract<DateRangeValue>, FormDateRangeFieldProps>; radio: FieldDef<OptionContract<Primitive>, FormRadioFieldProps>; segmented: FieldDef<OptionContract<SegmentedValue>, FormSegmentedFieldProps>; choiceCards: FieldDef<OptionContract<ChoiceCardValue>, FormChoiceCardsFieldProps>; multiChoiceCards: FieldDef<OptionsContract<MultiChoiceCardValue>, FormMultiChoiceCardsFieldProps>; checkboxGroup: FieldDef<OptionsContract<CheckboxGroupValue>, FormCheckboxGroupFieldProps>; chips: FieldDef<OptionsContract<ChipsValue>, FormChipsFieldProps>; slider: FieldDef<ExactContract<number>, FormSliderFieldProps>; range: FieldDef<ExactContract<[number, number]>, FormRangeFieldProps>; rating: FieldDef<ExactContract<number>, FormRatingFieldProps>; combobox: FieldDef<OptionContract<ComboboxValue>, FormComboboxFieldProps>; multiSelect: FieldDef<OptionsContract<MultiSelectValue>, FormMultiSelectFieldProps>; tags: FieldDef<ExactContract<readonly string[]>, FormTagsFieldProps>; file: FieldDef<ExactContract<readonly FileValue[]>, FormFileFieldProps>; }>
```
