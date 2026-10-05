import type { Meta, StoryObj } from '@storybook/react-vite'
import { RatingField } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Inputs/RatingField',
  component: RatingField,
  args: {
    label: 'Rate this release',
    description: 'Release 2.4, shipped on Thursday',
    name: 'rating',
    clearable: true,
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof RatingField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { required: true, error: 'Rate the release to see everyone else’s ratings' },
}

export const Horizontal: Story = { args: { layout: 'horizontal', defaultValue: 5 } }

/**
 * A clearable rating with a label and a description.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <RatingField
        label="How was your crossing?"
        description="Your rating is anonymous"
        clearable
      />
    )
  },
}
