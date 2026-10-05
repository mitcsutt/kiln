---
name: validation
description: "Use when adding validation to a @mitcsutt/kiln-forms form: field validators, a whole-form Standard Schema such as zod or valibot, warnings that never block submission, async checks, errors returned by a server with applyServerErrors, error timing, and focusing the first invalid field or the error summary."
metadata:
  purpose: Validate fields and whole forms, show errors and warnings at the right time, and put server errors back on their fields.
  type: core
  library: "@mitcsutt/kiln-forms"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/forms/getting-started/validation.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/rules.mdx
  - mitcsutt/kiln:apps/docs/content/docs/forms/schema/server-validation.mdx
  - mitcsutt/kiln:packages/forms/src/components/form/ErrorSummary/ErrorSummary.tsx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Validate a form

Validate fields and whole forms, show errors and warnings at the right time, and put server errors back on their fields.

kiln-forms validates with plain functions, any [Standard Schema](https://standardschema.dev) (zod, valibot, arktype), or both. No validation library is a dependency: use whichever your app already has.

```tsx
import { ErrorSummary, Form, FormSubmitError, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const TAKEN = ['ines', 'harbourmaster', 'admin']

export function Usage() {
  const form = useAppForm({
    defaultValues: { username: '', seats: null as number | null, promo: '' },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // The server has the last word: its errors land on the fields they belong to.
      if (value.promo !== '' && value.promo !== 'BAYLINE') {
        throw new FormSubmitError({ fields: { promo: "That code isn't valid for this sailing" } })
      }
    },
  })
  return (
    <Form form={form} aria-label="Create an account">
      <Stack gap={5}>
        <ErrorSummary />
        <form.TextField
          name="username"
          label="Username"
          description="Letters and numbers only"
          required
          warn={(value) => (/[A-Z]/.test(value) ? 'Usernames are case-sensitive' : undefined)}
          validators={{
            onDynamic: ({ value }) =>
              /^[a-z0-9]+$/i.test(value) ? undefined : 'Use letters and numbers only',
            onDynamicAsync: async ({ value }) => {
              await new Promise((resolve) => setTimeout(resolve, 400))
              return TAKEN.includes(value.toLowerCase()) ? 'That username is taken' : undefined
            },
          }}
        />
        <form.NumberField
          name="seats"
          label="Seats"
          min={1}
          max={9}
          validators={{
            onDynamic: ({ value }) => (value === null ? 'How many seats?' : undefined),
          }}
        />
        <form.TextField name="promo" label="Promo code" optional description="Try BAYLINE" />
        <SubmitButton>Create account</SubmitButton>
      </Stack>
    </Form>
  )
}
```

Try `Ines` as the username (taken, and a warning about case), leave seats empty, and submit with a promo code other than `BAYLINE` to see a server error land on its field.

## When validation runs

By default a field validates when it's left, and live on every change after that, or after any submit attempt. Its error shows at the same moments. That's "reward early, punish late": nobody is told off for an email address they haven't finished typing, and an error disappears the moment it's fixed. Change it with `validateOn` (`'blur'`, `'change'` or `'submit'`) and `errorVisibility` on `useAppForm`.

## Field validators

Pass `validators` to a bound field. `onDynamic` follows the timing above and is where most rules belong; `onDynamicAsync` is for checks against a server, and is debounced. TanStack's own slots (`onChange`, `onBlur`, `onSubmit` and their async forms) keep their usual meaning. Return a message to fail, or `undefined` to pass.

```tsx
<form.TextField
  name="username"
  label="Username"
  validators={{
    onDynamic: ({ value }) =>
      /^[a-z0-9]+$/i.test(value) ? undefined : 'Use letters and numbers only',
    onDynamicAsync: async ({ value }) =>
      (await isTaken(value)) ? 'That username is taken' : undefined,
  }}
/>
```

A validator that depends on another field lists it in `onChangeListenTo`, so it re-runs when that field changes.

## A schema for the whole form

Pass a Standard Schema as `schema`. Its issues are routed to the fields they belong to, and issues without a path become a form-level error. `onSubmit` receives the schema's parsed `output` (with any transforms applied) alongside `value`.

```tsx
const schema = z.object({
  email: z.email('Enter an email address'),
  seats: z.number().int().min(1, 'Book at least one seat'),
})

const form = useAppForm({
  defaultValues: { email: '', seats: 1 },
  schema,
  onSubmit: ({ output }) => book(output),
})
```

## Warnings

`warn` returns advice that shows in the caution tone and never blocks submission: "Usernames are case-sensitive", "That's further than most people walk". An error replaces the warning while it shows.

## Errors from the server

Throw a `FormSubmitError` from `onSubmit` and its errors land on the fields (and the form) they name. The form stays unsubmitted, focus moves to the first error, and the reader can fix it and resubmit. Any other error thrown from `onSubmit` is caught: it goes to `onSubmitError`, and by default shows "Something went wrong and we couldn't send this. Try again." as a form-level error. A submit never ends in an unhandled rejection.

```ts
throw new FormSubmitError({
  form: 'This sailing filled up while you were booking',
  fields: { seats: 'Only 2 seats are left' },
})
```

`applyServerErrors(form, errors)` does the same outside `onSubmit`, for errors that arrive another way.

```ts
declare function applyServerErrors<A extends AnyKitForm>(target: A, errors: ServerErrors<ValuesOfForm<A>>): void
```

Applies server errors: field messages → each field's `onServer` slot (source `field`, so other
fields' edits don't clear them); the form message (plus any message for a path with no field)
→ the form's `onServer` slot.

## Showing errors

- Each field shows its own error under the control.
- [`ErrorSummary`](references/error-summary.md) lists every error after a submit attempt, each a link to its field, the pattern GOV.UK uses. Place it at the top of the form.
- On an invalid submit, focus moves to the summary if there is one, else to the first invalid field in document order, after revealing the tab, accordion item or step it's in.

`focusFirstInvalid(form)` and `focusField(form, name)` do that by hand, from your own controls.

```ts
declare function focusFirstInvalid(form: AnyKitForm, within?: ScopeHandle | undefined): Promise<boolean>
```

After a frame (so `aria-invalid` is committed), focuses the first invalid field in DOM order,
revealing its tab/accordion/step first. Resolves `true` when something got focus.

```ts
declare function focusField(form: AnyKitForm, name: string): Promise<boolean>
```

Reveals the field's tab/accordion/step chain, then focuses its control.

`normaliseError` turns whatever a validator returned (a string, a Standard Schema issue, an array of them) into one shape, for custom fields and layouts that show errors themselves.

```ts
declare function normaliseError(e: unknown): NormalisedError | null
```

Turns any validator output into `{ message, code?, params?, path? }`: strings, Standard Schema
issues, `{ message }` objects and `Error`s. `true` → `{ message: '' }` (invalid, no text).
Anything else (falsy, numbers, arrays) → `null`.

## References

Read a reference when its description matches the task:

- [Rules](references/rules.md): Validation as JSON. Required, lengths, patterns, ranges, item counts and custom validators, plus the same rules as warnings.
- [Server validation](references/server-validation.md): Run a schema's rules on your server with the React-free schema entry, and trust its output rather than the raw input.
- [ErrorSummary](references/error-summary.md): After a failed submit, every error in one alert, each a link to its field. The GOV.UK pattern.
