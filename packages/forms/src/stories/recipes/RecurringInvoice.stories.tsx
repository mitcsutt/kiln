import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Amount, Button, Heading, Inline, Stack, Stat, Text } from '@mitcsutt/kiln-ui'
import { Form, SubmitButton } from '#components'
import { useFieldValue } from '#core/hooks'
import type { KitForm } from '#core/kit/types'
import { kit } from '#kit'
import { FormActions, FormSentence } from '#layouts'
import { recipeParameters } from '#stories/recipes/parameters'
import { RecipeFrame, SubmittedOutput } from '#stories/recipes/RecipeFrame'

/*
 * Recipe: Recurring invoice — a billing schedule written as one sentence (FormSentence). The
 * answer to "how much will this bring in this year?" is computed from the sentence as it's typed
 * and sits beside it; that number is the reason the form exists, so it gets the display type.
 */

interface RecurringInvoice {
  client: string
  amount: number | null
  start: string
  cadence: string | number | null
}

type InvoiceForm = KitForm<RecurringInvoice, undefined, typeof kit.registries.fields>

const YEAR_END = new Date('2026-12-31T00:00:00')

const CADENCE_LABEL: Record<string, string> = {
  week: 'one a week',
  fortnight: 'one a fortnight',
  month: 'one a month',
}

const dateLabel = (iso: string, withYear = true) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
  })

/** The nth invoice date after `first` at the chosen cadence (months keep the day of the month). */
function nthDate(first: Date, cadence: string, n: number): Date {
  if (cadence === 'month')
    return new Date(first.getFullYear(), first.getMonth() + n, first.getDate())
  const days = cadence === 'week' ? 7 : 14
  return new Date(first.getFullYear(), first.getMonth(), first.getDate() + n * days)
}

/** How many invoices go out between the start date and 31 December at the chosen cadence. */
function invoicesByYearEnd(start: string, cadence: string | number | null): number {
  if (!start || typeof cadence !== 'string' || !(cadence in CADENCE_LABEL)) return 0
  const first = new Date(`${start}T00:00:00`)
  let count = 0
  while (count < 60 && nthDate(first, cadence, count) <= YEAR_END) count += 1
  return count
}

function Forecast({ form }: { form: InvoiceForm }) {
  const amount = useFieldValue(form, 'amount')
  const start = useFieldValue(form, 'start')
  const cadence = useFieldValue(form, 'cadence')
  const count = invoicesByYearEnd(start, cadence)
  const total = amount !== null && start !== '' ? amount * count : null
  const cadenceLabel = typeof cadence === 'string' ? (CADENCE_LABEL[cadence] ?? '') : ''

  let hint = 'Fill in the sentence and the total appears here.'
  if (total !== null && count === 0) hint = 'The first invoice goes out after 31 December.'
  if (total !== null && count > 0) {
    hint = `${String(count)} ${count === 1 ? 'invoice' : 'invoices'}, ${cadenceLabel}, from ${dateLabel(start)}.`
  }

  return (
    <Stat
      size="hero"
      label="Invoiced by 31 December"
      value={
        total === null ? (
          <Text as="span" tone="muted">
            —
          </Text>
        ) : (
          <Amount value={total} currency="AUD" />
        )
      }
      hint={hint}
    />
  )
}

function InvoiceScreen({ initial }: { initial: RecurringInvoice }) {
  const [scheduled, setScheduled] = useState<RecurringInvoice | null>(null)
  const form = kit.useAppForm<RecurringInvoice>({
    defaultValues: initial,
    onSubmit: ({ output }) => {
      setScheduled(output)
    },
  })

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Heading level={1} size="xl">
          New recurring invoice
        </Heading>
        <Text tone="muted">Billing · $8,420.00 outstanding across 3 invoices</Text>
      </Stack>

      <Form form={form} aria-label="New recurring invoice">
        <Stack gap={8}>
          <FormSentence label="Recurring invoice">
            Bill{' '}
            <form.TextField
              name="client"
              label="Client"
              htmlSize={18}
              placeholder="Northwind Studio"
              validators={{
                onDynamic: ({ value }) => (value.trim() === '' ? 'Enter a client' : undefined),
              }}
            />{' '}
            <form.AmountField
              name="amount"
              label="Amount"
              currency="AUD"
              validators={{
                onDynamic: ({ value }) =>
                  value === null || value <= 0 ? 'Enter an amount to bill' : undefined,
              }}
            />{' '}
            every{' '}
            <form.SelectField
              name="cadence"
              label="How often"
              options={[
                { value: 'week', label: 'week' },
                { value: 'fortnight', label: 'fortnight' },
                { value: 'month', label: 'month' },
              ]}
            />{' '}
            starting{' '}
            <form.DateField
              name="start"
              label="Start date"
              min="2026-10-05"
              validators={{
                onDynamic: ({ value }) => (value === '' ? 'Pick a start date' : undefined),
              }}
            />
            .
          </FormSentence>
          <Forecast form={form} />
          <FormActions align="start">
            <SubmitButton>Schedule invoices</SubmitButton>
          </FormActions>
        </Stack>
      </Form>

      {scheduled ? (
        <Stack gap={4}>
          <Inline gap={3} justify="start" align="center">
            <Text weight="medium">
              Invoices scheduled. The first one goes to {scheduled.client} on{' '}
              {dateLabel(scheduled.start, false)}.
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setScheduled(null)
              }}
            >
              Hide
            </Button>
          </Inline>
          <SubmittedOutput value={scheduled} />
        </Stack>
      ) : null}
    </Stack>
  )
}

const meta = {
  title: 'Forms/Getting started/Recurring invoice',
  parameters: recipeParameters,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Blank: Story = {
  render: () => (
    <RecipeFrame theme="monograph">
      <InvoiceScreen initial={{ client: '', amount: null, start: '', cadence: 'month' }} />
    </RecipeFrame>
  ),
}

/** A monthly retainer: $2,400 from 1 November, so two invoices before the year ends. */
export const Retainer: Story = {
  render: () => (
    <RecipeFrame theme="monograph">
      <InvoiceScreen
        initial={{
          client: 'Northwind Studio',
          amount: 2400,
          start: '2026-11-01',
          cadence: 'month',
        }}
      />
    </RecipeFrame>
  ),
}
