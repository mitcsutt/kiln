import type { Meta, StoryObj } from '@storybook/react-vite'
import { reviewFixture, reviewSchema } from '#stories/fixtures/flow'
import { parityStory } from '#stories/parity'
import { FormReview } from './FormReview'

const meta = {
  title: 'Forms/Layouts/FormReview',
  component: FormReview,
  args: { children: null },
} satisfies Meta<typeof FormReview>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(reviewFixture, reviewSchema, ['FormReview'])
