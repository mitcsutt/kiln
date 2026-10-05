import type { Meta, StoryObj } from '@storybook/react-vite'
import { AmountField } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Inputs/AmountField',
  component: AmountField,
  args: {
    label: 'Monthly retainer',
    description: 'Billed on the 1st to Northwind Studio',
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
  args: { defaultValue: null, error: 'Enter the monthly retainer' },
}

export const Warning: Story = {
  args: { defaultValue: 245000, warning: 'That is £1,000 more than last month' },
}

/**
 * Store money in minor units (`unit="minor"`, integer pence) so it's never a float.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <AmountField
        label="Top-up"
        description="Between £5 and £200"
        currency="GBP"
        locale="en-GB"
        defaultValue={20}
        min={5}
        max={200}
      />
    )
  },
}
