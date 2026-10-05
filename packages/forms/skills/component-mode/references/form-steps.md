<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# FormSteps

> A form split into steps, validated one step at a time, with focus and announcements handled.

Source: https://kiln.mitchellsutton.com/docs/forms/layouts/form-steps

`FormSteps` shows a [Stepper](https://kiln.mitchellsutton.com/docs/ui/navigation/stepper) and one step at a time, with Back and Next. **Next** validates the current step's fields; if any are invalid it stays, shows their errors and focuses the first. Otherwise it moves on, focuses the new step's heading and announces "Step 2 of 3". On the last step, Next submits the form. The final submit validates every step, and an error in an earlier step takes you back to it.

```tsx
import { Form, FormStep, FormSteps, useAppForm } from '@mitcsutt/kiln-forms'
import { Alert } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [done, setDone] = useState(false)
  const form = useAppForm({
    defaultValues: { from: '', to: '', date: '', passengers: 1 },
    onSubmit: () => {
      setDone(true)
    },
  })
  if (done)
    return (
      <Alert tone="positive" title="Sailing booked">
        Your tickets are on their way.
      </Alert>
    )
  return (
    <Form form={form} aria-label="Book a sailing">
      <FormSteps label="Booking" headingLevel={3} submitLabel="Book sailing">
        <FormStep value="route" title="Route">
          <form.TextField
            name="from"
            label="From"
            validators={{
              onDynamic: ({ value }) => (value ? undefined : 'Where are you leaving from?'),
            }}
          />
          <form.TextField
            name="to"
            label="To"
            validators={{
              onDynamic: ({ value }) => (value ? undefined : 'Where are you going?'),
            }}
          />
        </FormStep>
        <FormStep value="when" title="When">
          <form.DateField
            name="date"
            label="Date"
            validators={{ onDynamic: ({ value }) => (value ? undefined : 'Choose a date') }}
          />
        </FormStep>
        <FormStep value="who" title="Passengers">
          <form.NumberField name="passengers" label="Passengers" min={1} max={9} stepper />
        </FormStep>
      </FormSteps>
    </Form>
  )
}
```

- `linear` (on by default) stops the reader skipping ahead past an invalid step.
- Control the step with `value` and `onValueChange` to keep it in the URL, so a link can open the form at a step.
- A `FormStep` takes a Standard Schema as `schema` for extra checks on that step only.
- Wrap a step in [`When`](./when.md) to make it conditional: it leaves the sequence while hidden, and its values are pruned. See [Onboarding](./onboarding.md).

## Your own navigation

`nav="none"` removes the built-in buttons, and `useFormSteps()` inside the steps gives you the state and the moves: `next()`, `back()`, `goTo(step)`, `index`, `count`, `isFirst`, `isLast`.

```tsx
import { Form, FormStep, FormSteps, useAppForm, useFormSteps } from '@mitcsutt/kiln-forms'
import { Button, Inline, Text } from '@mitcsutt/kiln-ui'

function Nav() {
  const steps = useFormSteps()
  return (
    <Inline justify="between">
      <Text size="sm" tone="muted">
        {steps.index + 1} of {steps.count}
      </Text>
      <Inline gap={2}>
        {steps.isFirst ? null : (
          <Button
            variant="ghost"
            tone="neutral"
            onClick={() => {
              steps.back()
            }}
          >
            Back
          </Button>
        )}
        <Button
          type={steps.isLast ? 'submit' : 'button'}
          onClick={steps.isLast ? undefined : () => void steps.next()}
        >
          {steps.isLast ? 'Finish' : 'Next'}
        </Button>
      </Inline>
    </Inline>
  )
}

export function CustomNav() {
  const form = useAppForm({ defaultValues: { name: '', stop: '' } })
  return (
    <Form form={form} aria-label="Quick setup">
      <FormSteps label="Setup" nav="none" headingLevel={3}>
        <FormStep value="name" title="Your name">
          <form.TextField name="name" label="Name" />
          <Nav />
        </FormStep>
        <FormStep value="stop" title="Home stop">
          <form.TextField name="stop" label="Stop" />
          <Nav />
        </FormStep>
      </FormSteps>
    </Form>
  )
}
```

```ts
declare function useFormSteps(): StepsApi
```

The steps API inside `FormSteps` — for custom chrome (§9.8).

## In a schema

```json
{
  "layout": "steps",
  "label": "Booking",
  "children": [{ "layout": "step", "value": "route", "title": "Route", "children": [] }]
}
```

## API

`FormStepsProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` |  | Accessible name for the step indicator. |
| `value` | `string` |  | Controlled current step — deep-linkable (a router search param). |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(step: string) => void` |  |  |
| `linear` | `boolean` | `true` | `true` (default): going forward validates every step in between. |
| `nav` | `'none' \| 'auto'` | `'auto'` | `'auto'` (default) renders Back / Next / Submit in an `ActionBar`; `'none'` for custom chrome (`useFormSteps`). |
| `backLabel` | `string` |  |  |
| `nextLabel` | `string` |  |  |
| `submitLabel` | `string` |  |  |
| `headingLevel` | `2 \| 3 \| 4` | `3` | Heading level of each step's title. Default 3. |
| `compactBelow` | `'sm' \| 'md'` |  | Below this breakpoint the Stepper collapses to one line: `messages.stepCompact` + the step title. |
| `children` (required) | `ReactNode` |  |  |

`FormStepProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `string` |  |  |
| `title` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `schema` | `StandardSchemaV1` |  | Extra validation for this step; issues are filtered to this step's fields. |
| `children` (required) | `ReactNode` |  |  |
| `scopeNames` | `readonly string[]` |  |  |

`StepsApi`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` (required) | `readonly { value: string; title: ReactNode; status: StepStatus }[]` |  |  |
| `current` (required) | `string` |  |  |
| `index` (required) | `number` |  |  |
| `count` (required) | `number` |  |  |
| `isFirst` (required) | `boolean` |  |  |
| `isLast` (required) | `boolean` |  |  |
| `next` (required) | `() => Promise<boolean>` |  | Validates the current step; advances if valid (on the last step: submits the form). |
| `back` (required) | `() => void` |  |  |
| `goTo` (required) | `(step: string) => Promise<boolean>` |  | Goes to a step. With `linear`, going forward validates every step in between. |
