import type { Meta, StoryObj } from '@storybook/react-vite'
import { contentFixture, contentSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'

const meta = {
  title: 'Forms/Schema/Content nodes',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Every `content` kind next to the components it stands for. Submit empty to fill the error summary. */
export const ComponentAndSchema: Story = parityStory(contentFixture, contentSchema, [
  'Heading',
  'Text',
  'ErrorSummary',
  'Alert',
  'Divider',
  'FormStatus',
  'SubmitButton',
])
