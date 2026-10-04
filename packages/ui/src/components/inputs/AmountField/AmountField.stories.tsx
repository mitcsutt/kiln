import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { AmountField } from './AmountField'

const meta = {
  title: 'UI/Inputs/AmountField',
  component: AmountField,
  args: {
    label: 'Monthly rent',
    description: 'Paid on the 1st to Harbour Lettings',
    currency: 'GBP',
    locale: 'en-GB',
    unit: 'minor',
    defaultValue: 145000,
    required: true,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '24rem' }}>
      <AmountField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof AmountField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { defaultValue: null, error: 'Enter the monthly rent' },
}

export const Warning: Story = {
  args: { defaultValue: 245000, warning: 'That is £1,000 more than last month' },
}
