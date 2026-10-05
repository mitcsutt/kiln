import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { SliderField } from './SliderField'

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
