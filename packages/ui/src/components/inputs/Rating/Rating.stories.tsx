import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Rating } from './Rating'

const meta = {
  title: 'UI/Inputs/Rating',
  component: Rating,
  args: {
    'aria-label': 'Rate this fixture',
    defaultValue: 4,
    max: 5,
    clearable: true,
    size: 'md',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
} satisfies Meta<typeof Rating>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={4}>
      <Rating {...args} size="sm" aria-label="Rate this fixture, small" />
      <Rating {...args} size="md" aria-label="Rate this fixture, medium" />
      <Rating {...args} size="lg" aria-label="Rate this fixture, large" />
    </Stack>
  ),
}

export const Unrated: Story = { args: { defaultValue: null } }

export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 3 } }

export const Invalid: Story = { args: { invalid: true, defaultValue: null } }

export const Disabled: Story = { args: { disabled: true } }
