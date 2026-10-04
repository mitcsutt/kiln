import type { Meta, StoryObj } from '@storybook/react-vite'
import { sentenceFixture, sentenceSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'
import { FormSentence } from './FormSentence'

const meta = {
  title: 'Forms/Layouts/FormSentence',
  component: FormSentence,
  args: { label: 'Savings goal', children: null },
} satisfies Meta<typeof FormSentence>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(sentenceFixture, sentenceSchema, [
  'FormSentence',
])
