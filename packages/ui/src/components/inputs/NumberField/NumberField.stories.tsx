import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { NumberField } from './NumberField'

const meta = {
  title: 'UI/Inputs/NumberField',
  component: NumberField,
  args: {
    label: 'Guests',
    description: 'Including you',
    defaultValue: 2,
    min: 1,
    max: 12,
    required: false,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '20rem' }}>
      <NumberField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof NumberField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { defaultValue: 14, max: 14, error: 'The long table seats 12' },
}

export const Horizontal: Story = {
  args: {
    label: 'Nights',
    description: 'Check-in Friday 6 November',
    layout: 'horizontal',
    defaultValue: 3,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '36rem' }}>
      <NumberField {...args} />
    </Stack>
  ),
}
