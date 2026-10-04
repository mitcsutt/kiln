import type { Meta, StoryObj } from '@storybook/react-vite'
import { RatingField } from './RatingField'

const meta = {
  title: 'UI/Inputs/RatingField',
  component: RatingField,
  args: {
    label: 'Rate this fixture',
    description: 'Hawks v Rovers, the cup final',
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
  args: { required: true, error: 'Rate the match to see everyone else’s ratings' },
}

export const Horizontal: Story = { args: { layout: 'horizontal', defaultValue: 5 } }
