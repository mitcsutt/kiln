'use client'

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
