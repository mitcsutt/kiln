import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormReview, useAppForm } from '@mitcsutt/kiln-forms'
import { reviewFixture, reviewSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'

const meta = {
  title: 'Forms/Layouts/FormReview',
  component: FormReview,
  args: { title: 'Check your booking', editLabel: 'Change', children: null },
} satisfies Meta<typeof FormReview>

export default meta
type Story = StoryObj<typeof meta>

const sessions = [
  { value: 'morning', label: 'Morning, 9:30 to 12:30' },
  { value: 'afternoon', label: 'Afternoon, 1:30 to 4:30' },
]

/** The answers so far, read back before submitting. An empty answer shows as not provided. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm
      label="Booking"
      submitLabel="Confirm booking"
      defaultValues={{ name: 'Priya Shah', email: '', session: 'afternoon' }}
    >
      {(form) => (
        <FormReview {...args}>
          <form.TextField name="name" label="Full name" />
          <form.TextField name="email" label="Email" />
          <form.RadioField name="session" label="Session" options={sessions} />
        </FormReview>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(reviewFixture, reviewSchema, ['FormReview'])

/**
 * `onEdit` with `step` adds an Edit button that takes the reader back to that step. No field
 * instances are created in view mode, so a review never interferes with the fields it repeats.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: {
        from: 'Harbour Square',
        to: 'Kelso Bay Pier',
        date: '2026-10-14',
        ticket: 'return',
        fare: 8.4,
      },
    })
    return (
      <Form form={form} aria-label="Your booking">
        <FormReview title="Your booking">
          <form.TextField name="from" label="From" />
          <form.TextField name="to" label="To" />
          <form.DateField name="date" label="Date" />
          <form.SegmentedField
            name="ticket"
            label="Ticket"
            options={[
              { value: 'single', label: 'Single' },
              { value: 'return', label: 'Return' },
            ]}
          />
          <form.AmountField name="fare" label="Fare" currency="GBP" locale="en-GB" />
        </FormReview>
      </Form>
    )
  },
}
