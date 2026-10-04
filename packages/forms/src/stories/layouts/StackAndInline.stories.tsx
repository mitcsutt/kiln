import type { Meta, StoryObj } from '@storybook/react-vite'
import { inlineFixture, inlineSchema, stackFixture, stackSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'

// `stack` and `inline` are ui's own `Stack` / `Inline` in schema mode; there is no forms wrapper.
const meta = {
  title: 'Forms/Layouts/Stack and inline',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Stack: Story = parityStory(stackFixture, stackSchema, ['Stack'], 'Stack')

export const Inline: Story = parityStory(
  inlineFixture,
  inlineSchema,
  ['Inline', 'SubmitButton'],
  'Inline',
)
