import type { Meta, StoryObj } from '@storybook/react-vite'
import { sentenceFixture, sentenceSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormSentence } from './FormSentence'

const meta = {
  title: 'Forms/Layouts/FormSentence',
  component: FormSentence,
  args: { label: 'Recurring invoice', children: null },
} satisfies Meta<typeof FormSentence>

export default meta
type Story = StoryObj<typeof meta>

interface RecurringInvoice {
  client: string
  amount: number | null
  start: string
}

const invoice: RecurringInvoice = { client: '', amount: null, start: '' }

/** A form read as one sentence. Each field keeps its own accessible label. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm label="Recurring invoice" defaultValues={invoice}>
      {(form) => (
        <FormSentence {...args}>
          Bill <form.TextField name="client" label="Client" htmlSize={14} />{' '}
          <form.AmountField name="amount" label="Amount" currency="GBP" /> every month starting{' '}
          <form.DateField name="start" label="Start date" />.
        </FormSentence>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(sentenceFixture, sentenceSchema, [
  'FormSentence',
])
