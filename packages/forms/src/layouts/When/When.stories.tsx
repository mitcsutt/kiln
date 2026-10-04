import type { Meta, StoryObj } from '@storybook/react-vite'
import { whenFixture, whenSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'

// `When` is generic over the form, so the meta names no `component`.
const meta = {
  title: 'Forms/Layouts/When',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Switch to "Collect from the shop": the address unmounts and is pruned from the output. */
export const ComponentAndSchema: Story = parityStory(whenFixture, whenSchema, ['When'])
