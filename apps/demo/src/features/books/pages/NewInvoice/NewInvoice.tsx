import {
  ErrorSummary,
  Form,
  FormActions,
  FormSection,
  FormSentence,
  FormSubmitError,
  kit,
  Repeater,
  SubmitButton,
  useFields,
  useFieldValue,
  withFieldGroup,
} from '@mitcsutt/kiln-forms'
import { dragAndDrop } from '@mitcsutt/kiln-forms/dnd'
import { Alert, Amount, Grid, Page, Stack, Text, toast } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

import { PageHeader } from '#components/PageHeader'
import { saveInvoice, type InvoiceDraft } from '#features/books/data/ledger'

import { FeeCalculator } from './components/FeeCalculator'

/** The default kit with drag and drop, so repeated invoice lines can be dragged into order. */
const invoiceKit = kit.extend({ dragAndDrop })

/** A reusable pair of fields, bound wherever a form has `{ every, amount, start }`. */
const Schedule = withFieldGroup({
  defaultValues: {
    every: null as 'month' | 'term' | null,
    amount: null as number | null,
    start: '',
  },
  render: function Schedule({ group }) {
    const fields = useFields(group)
    return (
      <FormSentence label="Repeat this invoice">
        Send{' '}
        <fields.AmountField
          name="amount"
          label="Amount"
          currency="GBP"
          locale="en-GB"
          htmlSize={7}
        />{' '}
        every{' '}
        <fields.SelectField
          name="every"
          label="How often"
          placeholder="never"
          options={[
            { value: 'month', label: 'month' },
            { value: 'term', label: 'school term' },
          ]}
        />{' '}
        from <fields.DateField name="start" label="First invoice" />.
      </FormSentence>
    )
  },
})

const EMPTY: InvoiceDraft = {
  client: '',
  reference: 'INV-2026-119',
  period: { start: '2026-10-01', end: '2026-10-31' },
  lines: [
    { description: 'Kiln hire, cone 6, two shelves', quantity: 2, price: 24 },
    { description: 'Glaze materials', quantity: 1, price: 18.5 },
  ],
  notes: '',
  schedule: { every: null, amount: null, start: '' },
}

/** An invoice, line by line: drag lines into order, and the total keeps up as you type. */
export function NewInvoice() {
  const [saved, setSaved] = useState<string | null>(null)
  const form = invoiceKit.useAppForm<InvoiceDraft>({
    defaultValues: EMPTY,
    onSubmit: async ({ value }) => {
      const result = await saveInvoice(value)
      if (!result.ok) throw new FormSubmitError({ fields: { client: result.message } })
      setSaved(result.id)
      toast({ title: `${result.id} saved`, tone: 'positive' })
    },
  })
  const lines = useFieldValue(form, 'lines')
  const total = lines.reduce((sum, line) => sum + (line.quantity ?? 0) * (line.price ?? 0), 0)
  return (
    <Page>
      <PageHeader
        kicker="Books"
        title="New invoice"
        description="Type “Unknown client” as the client to see the books reject it."
        theme="ledger"
      />
      {saved ? (
        <Alert tone="positive" title={`${saved} saved`}>
          It&apos;s in the ledger as a draft until you send it.
        </Alert>
      ) : null}
      <Grid columns={{ base: 1, lg: 3 }} gap={6}>
        <Grid.Item span={{ base: 1, lg: 2 }}>
          <Form form={form} aria-label="New invoice">
            <Stack gap={6}>
              <ErrorSummary />
              <FormSection title="Who and when">
                <form.TextField
                  name="client"
                  label="Client"
                  required
                  validators={{
                    onDynamic: ({ value }) =>
                      value.trim() ? undefined : 'Who is this invoice for?',
                  }}
                />
                <form.TextField name="reference" label="Reference" readOnly />
                <form.DateRangeField
                  name="period"
                  label="Service period"
                  startLabel="From"
                  endLabel="To"
                />
              </FormSection>
              <Repeater
                form={form}
                name="lines"
                label="Lines"
                variant="table"
                reorderable="drag"
                min={1}
                newItem={{ description: '', quantity: 1, price: null }}
                columns={[
                  { header: 'Description' },
                  { header: 'Qty', width: 'min' },
                  { header: 'Price', width: 'min' },
                ]}
                addLabel="Add a line"
              >
                {(item) => (
                  <>
                    <item.fields.TextField name="description" label="Description" />
                    <item.fields.NumberField
                      name="quantity"
                      label="Quantity"
                      min={1}
                      htmlSize={4}
                    />
                    <item.fields.AmountField
                      name="price"
                      label="Price"
                      currency="GBP"
                      locale="en-GB"
                      htmlSize={7}
                    />
                  </>
                )}
              </Repeater>
              <Text size="lg" weight="strong" aria-live="polite">
                Total <Amount value={total} currency="GBP" locale="en-GB" />
              </Text>
              <Schedule form={form} fields="schedule" />
              <form.TextareaField name="notes" label="Note to the client" optional />
              <FormActions>
                <SubmitButton>Save invoice</SubmitButton>
              </FormActions>
            </Stack>
          </Form>
        </Grid.Item>
        <FeeCalculator />
      </Grid>
    </Page>
  )
}
