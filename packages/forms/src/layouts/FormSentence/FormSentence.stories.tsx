import type { Meta, StoryObj } from '@storybook/react-vite'
import { sentenceFixture, sentenceSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormSentence } from './FormSentence'

const meta = {
  title: 'Forms/Layouts/FormSentence',
  component: FormSentence,
  args: { label: 'Savings goal', children: null },
} satisfies Meta<typeof FormSentence>

export default meta
type Story = StoryObj<typeof meta>

interface SavingsGoal {
  target: number | null
  goal: string
  deadline: string
}

const goal: SavingsGoal = { target: null, goal: '', deadline: '' }

/** A form read as one sentence. Each field keeps its own accessible label. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm label="Savings goal" defaultValues={goal}>
      {(form) => (
        <FormSentence {...args}>
          I want to save <form.AmountField name="target" label="Target amount" currency="GBP" /> for{' '}
          <form.TextField name="goal" label="Goal" htmlSize={14} /> by{' '}
          <form.DateField name="deadline" label="Deadline" />.
        </FormSentence>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(sentenceFixture, sentenceSchema, [
  'FormSentence',
])
