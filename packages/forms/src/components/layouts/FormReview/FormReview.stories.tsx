import type { Meta, StoryObj } from '@storybook/react-vite'
import { reviewFixture, reviewSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormReview } from './FormReview'

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
