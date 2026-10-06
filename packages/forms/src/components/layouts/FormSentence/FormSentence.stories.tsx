import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormSentence, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'
import { sentenceFixture, sentenceSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'

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

/**
 * Use it for short, low-stakes forms: a reminder, a filter, a goal. Never for long data entry.
 * `label` names the group.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: {
        day: 'weekdays',
        time: '07:30',
        minutes: 10,
      },
    })
    return (
      <Form form={form} aria-label="Departure reminder">
        <Stack gap={5}>
          <FormSentence label="Departure reminder">
            Remind me on{' '}
            <form.SelectField
              name="day"
              label="Days"
              options={[
                { value: 'weekdays', label: 'weekdays' },
                { value: 'weekends', label: 'weekends' },
                { value: 'every', label: 'every day' },
              ]}
            />{' '}
            at <form.TimeField name="time" label="Time" />,{' '}
            <form.NumberField name="minutes" label="Minutes before" min={5} max={60} htmlSize={3} />{' '}
            minutes before my sailing.
          </FormSentence>
          <SubmitButton>Set reminder</SubmitButton>
        </Stack>
      </Form>
    )
  },
}
