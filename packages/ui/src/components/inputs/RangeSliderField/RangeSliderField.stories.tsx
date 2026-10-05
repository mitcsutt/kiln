import type { Meta, StoryObj } from '@storybook/react-vite'
import { RangeSliderField } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Inputs/RangeSliderField',
  component: RangeSliderField,
  args: {
    label: 'Price range',
    description: 'Per seat, per month',
    name: 'price',
    min: 500,
    max: 5000,
    step: 100,
    defaultValue: [1200, 2400],
    showValue: true,
    formatOptions: { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 },
    locale: 'en-GB',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '32rem' }}>
      <RangeSliderField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof RangeSliderField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = { args: { error: 'The range is wider than any listing we have' } }

/**
 * A fare range in pounds, with each thumb named and the values shown.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <RangeSliderField
        label="Fare range"
        thumbLabels={['Lowest fare', 'Highest fare']}
        defaultValue={[2, 8]}
        min={0}
        max={12}
        step={0.5}
        showValue
        formatOptions={{ style: 'currency', currency: 'GBP' }}
      />
    )
  },
}
