import type { Meta, StoryObj } from '@storybook/react-vite'
import { SliderField } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Inputs/SliderField',
  component: SliderField,
  args: {
    label: 'Discount rate',
    description: 'Taken off each invoice',
    name: 'discountRate',
    defaultValue: 20,
    max: 50,
    step: 5,
    showValue: true,
    formatOptions: { style: 'unit', unit: 'percent' },
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '32rem' }}>
      <SliderField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof SliderField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithWarning: Story = {
  args: { defaultValue: 45, warning: 'That is higher than most clients get' },
}

export const WithError: Story = {
  args: { defaultValue: 50, error: 'Discounts over 40% need sign-off from finance' },
}

export const Horizontal: Story = { args: { layout: 'horizontal' } }

/**
 * Show the value (`showValue`): a slider's position alone is hard to read exactly.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <SliderField
        label="Maximum walk to a stop"
        description="We'll only suggest routes within this distance"
        defaultValue={800}
        min={200}
        max={2000}
        step={100}
        showValue
        formatOptions={{ style: 'unit', unit: 'meter' }}
      />
    )
  },
}
