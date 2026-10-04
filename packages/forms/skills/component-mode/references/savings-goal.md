<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Savings goal

> A form written as a sentence, with a value computed from the others as you type.

Source: https://kiln.mitchellsutton.com/docs/forms/getting-started/savings-goal

A short, low-stakes form can read as a sentence. The monthly amount is derived from the target and the number of months, and recomputed as either changes.

```tsx
import {
  Form,
  FormActions,
  FormSentence,
  SubmitButton,
  useAppForm,
  useFieldValue,
} from '@mitcsutt/kiln-forms'
import { Amount, Stack, Text } from '@mitcsutt/kiln-ui'

interface Goal {
  target: number | null
  months: number | null
  monthly: number | null
}

export default function SavingsGoal() {
  const form = useAppForm<Goal>({
    defaultValues: { target: 790, months: 10, monthly: 79 },
    // Recomputed whenever target or months change, without marking the form dirty.
    derive: [
      {
        field: 'monthly',
        from: ['target', 'months'],
        compute: (values) =>
          values.target !== null && values.months
            ? Math.ceil((values.target / values.months) * 100) / 100
            : null,
      },
    ],
  })
  const monthly = useFieldValue(form, 'monthly')
  return (
    <Form form={form} aria-label="Save for an annual pass">
      <Stack gap={5}>
        <FormSentence label="Savings goal">
          I want to save{' '}
          <form.AmountField
            name="target"
            label="Target amount"
            currency="GBP"
            locale="en-GB"
            htmlSize={7}
          />{' '}
          over{' '}
          <form.NumberField name="months" label="Number of months" min={1} max={24} htmlSize={3} />{' '}
          months.
        </FormSentence>
        {monthly === null ? (
          <Text tone="muted">Fill in the sentence to see the monthly amount.</Text>
        ) : (
          <Text>
            That&apos;s <Amount value={monthly} currency="GBP" locale="en-GB" /> a month.
          </Text>
        )}
        <FormActions align="start">
          <SubmitButton>Start saving</SubmitButton>
        </FormActions>
      </Stack>
    </Form>
  )
}
```

## How it's built

- **`FormSentence`** sets its fields inline, hides their labels visually (screen readers still hear them), and lists any errors below the sentence. Use it for goals and filters, never for long data entry.
- **`derive`** on `useAppForm` recomputes `monthly` whenever `target` or `months` changes. Derived writes don't mark the form dirty.
- **`useFieldValue`** reads one value for display, re-rendering only when it changes.
