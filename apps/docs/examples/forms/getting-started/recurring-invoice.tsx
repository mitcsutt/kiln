'use client'

import {
  Form,
  FormActions,
  FormSentence,
  SubmitButton,
  useAppForm,
  useFieldValue,
} from '@mitcsutt/kiln-forms'
import { Amount, Stack, Stat, Text } from '@mitcsutt/kiln-ui'

type Cadence = 'week' | 'fortnight' | 'month'

interface Schedule {
  client: string
  amount: number | null
  cadence: Cadence | null
  start: string
  total: number | null
}

const DAY = 24 * 60 * 60 * 1000

/** How many invoices go out from `start` (YYYY-MM-DD) to 31 December of the same year. */
function invoicesThisYear(start: string, cadence: Cadence): number {
  const [year = 0, month = 1, day = 1] = start.split('-').map(Number)
  if (cadence === 'month') return 13 - month
  const days = (Date.UTC(year, 11, 31) - Date.UTC(year, month - 1, day)) / DAY
  return Math.floor(days / (cadence === 'week' ? 7 : 14)) + 1
}

export default function RecurringInvoice() {
  const form = useAppForm<Schedule>({
    defaultValues: {
      client: 'Northwind Studio',
      amount: 1200,
      cadence: 'month',
      start: '2026-11-01',
      total: 2400,
    },
    // Recomputed whenever the amount, cadence or start date change, without marking the form dirty.
    derive: [
      {
        field: 'total',
        from: ['amount', 'cadence', 'start'],
        compute: (values) =>
          values.amount !== null && values.cadence && values.start
            ? values.amount * invoicesThisYear(values.start, values.cadence)
            : null,
      },
    ],
  })
  const total = useFieldValue(form, 'total')
  return (
    <Form form={form} aria-label="Schedule a recurring invoice">
      <Stack gap={5}>
        <FormSentence label="Recurring invoice">
          Bill <form.TextField name="client" label="Client" htmlSize={14} />{' '}
          <form.AmountField
            name="amount"
            label="Amount"
            currency="GBP"
            locale="en-GB"
            htmlSize={7}
          />{' '}
          every{' '}
          <form.SelectField
            name="cadence"
            label="Cadence"
            options={[
              { value: 'week', label: 'week' },
              { value: 'fortnight', label: 'fortnight' },
              { value: 'month', label: 'month' },
            ]}
          />{' '}
          starting <form.DateField name="start" label="First invoice" />.
        </FormSentence>
        <Stat
          label="Invoiced by 31 December"
          value={
            total === null ? (
              <Text as="span" tone="muted">
                Not scheduled
              </Text>
            ) : (
              <Amount value={total} currency="GBP" locale="en-GB" />
            )
          }
          hint={total === null ? 'Fill in the sentence to see the total.' : undefined}
        />
        <FormActions align="start">
          <SubmitButton>Schedule invoices</SubmitButton>
        </FormActions>
      </Stack>
    </Form>
  )
}
